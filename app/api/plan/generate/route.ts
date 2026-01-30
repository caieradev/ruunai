import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getGeminiModel } from '@/lib/ai/gemini'
import { buildPlanInput, buildPreviousPlanSummary, buildSystemPrompt } from '@/lib/ai/prompt'
import type { GeminiPlanOutput } from '@/lib/ai/types'
import type { OnboardingData } from '@/lib/onboarding/types'
import type { TrainingDayRow, TrainingPlanRow, PlanFeedback } from '@/lib/supabase/types'

const ALLOWED_TYPES = ['new', 'regenerate'] as const
const ALLOWED_LANGUAGES = ['en', 'pt-BR', 'es'] as const
const ALLOWED_WORKOUT_TYPES = ['easy_run', 'tempo', 'intervals', 'long_run', 'recovery', 'cross_training', 'race_pace'] as const
const MAX_COMMENT_LENGTH = 500
const MAX_STRING_LENGTH = 2000

const ALLOWED_DIFFICULTIES = ['TOO_EASY', 'ADEQUATE', 'TOO_HARD'] as const
const ALLOWED_VOLUMES = ['WANTED_MORE', 'GOOD', 'TOO_MUCH'] as const
const ALLOWED_VARIETIES = ['WANTED_MORE', 'GOOD', 'TOO_MUCH'] as const
const ALLOWED_INJURIES = ['NO_ISSUES', 'HAD_DISCOMFORT', 'GOT_INJURED'] as const

function isValidFeedback(feedback: unknown): feedback is PlanFeedback {
  if (!feedback || typeof feedback !== 'object') return false
  const f = feedback as Record<string, unknown>
  return (
    ALLOWED_DIFFICULTIES.includes(f.difficulty as typeof ALLOWED_DIFFICULTIES[number]) &&
    ALLOWED_VOLUMES.includes(f.volume as typeof ALLOWED_VOLUMES[number]) &&
    ALLOWED_VARIETIES.includes(f.variety as typeof ALLOWED_VARIETIES[number]) &&
    ALLOWED_INJURIES.includes(f.injuries as typeof ALLOWED_INJURIES[number]) &&
    (f.comments === undefined || (typeof f.comments === 'string' && f.comments.length <= MAX_COMMENT_LENGTH))
  )
}

function validateGeminiOutput(output: unknown): output is GeminiPlanOutput {
  if (!output || typeof output !== 'object') return false
  const o = output as Record<string, unknown>

  if (!o.plan_overview || typeof o.plan_overview !== 'object') return false
  const overview = o.plan_overview as Record<string, unknown>
  if (typeof overview.title !== 'string' || typeof overview.description !== 'string' || typeof overview.weekly_summary !== 'string') return false

  if (!Array.isArray(o.days)) return false
  for (const day of o.days) {
    if (!day || typeof day !== 'object') return false
    const d = day as Record<string, unknown>
    if (typeof d.day_number !== 'number' || d.day_number < 1 || d.day_number > 30) return false
    if (!ALLOWED_WORKOUT_TYPES.includes(d.workout_type as typeof ALLOWED_WORKOUT_TYPES[number])) return false
    if (typeof d.title !== 'string' || typeof d.description !== 'string') return false
  }

  return true
}

function truncateString(value: unknown, maxLen: number): string | null {
  if (value === undefined || value === null) return null
  const str = String(value)
  return str.length > maxLen ? str.slice(0, maxLen) : str
}

export async function POST(request: Request) {
  let lockPlanId: string | null = null
  let supabase: Awaited<ReturnType<typeof getSupabaseServerClient>> | null = null

  try {
    supabase = await getSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, language, feedback } = body as {
      type: string
      language: string
      feedback?: unknown
    }

    if (!ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (!ALLOWED_LANGUAGES.includes(language as typeof ALLOWED_LANGUAGES[number])) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    }

    if (feedback !== undefined && !isValidFeedback(feedback)) {
      return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 })
    }

    const validatedType = type as 'new' | 'regenerate'
    const validatedLanguage = language as typeof ALLOWED_LANGUAGES[number]
    const validatedFeedback = feedback as PlanFeedback | undefined

    // 1. Check for existing generating plan (lock)
    const { data: generatingPlan } = await supabase
      .from('training_plans')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('status', 'generating')
      .single()

    if (generatingPlan) {
      const createdAt = new Date(generatingPlan.created_at).getTime()
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000

      if (createdAt > fiveMinutesAgo) {
        return NextResponse.json({ error: 'Plan generation already in progress' }, { status: 409 })
      }

      // Stale lock — clean up
      await supabase.from('training_plans').delete().eq('id', generatingPlan.id)
    }

    // 2. Fetch onboarding data
    const { data: responses } = await supabase
      .from('runner_responses')
      .select('payload')
      .eq('user_id', user.id)
      .single()

    if (!responses) {
      return NextResponse.json({ error: 'Onboarding data not found' }, { status: 404 })
    }

    const onboardingData = responses.payload as OnboardingData

    // 3. Fetch current active plan (if exists)
    const { data: activePlan } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single() as { data: TrainingPlanRow | null }

    // 4. Check regeneration limit
    if (validatedType === 'regenerate' && activePlan) {
      if (activePlan.generation_count >= 10) {
        return NextResponse.json({ error: 'Regeneration limit reached (10/month)' }, { status: 429 })
      }
    }

    // 5. Build previous plan summary (for subsequent plans)
    let previousPlanSummary = null
    if (activePlan && validatedType === 'new') {
      const { data: days } = await supabase
        .from('training_days')
        .select('*')
        .eq('plan_id', activePlan.id)
        .order('day_number') as { data: TrainingDayRow[] | null }

      const previousDays = days ?? []
      previousPlanSummary = buildPreviousPlanSummary(activePlan, previousDays)
    }

    // 6. Create lock record
    const startDate = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data: newPlan, error: insertError } = await supabase
      .from('training_plans')
      .insert({
        user_id: user.id,
        status: 'generating',
        language: validatedLanguage,
        starts_at: startDate,
        ends_at: endDate,
        feedback: validatedFeedback ?? null,
        previous_plan_id: activePlan?.id ?? null,
        generation_count: validatedType === 'regenerate' ? (activePlan?.generation_count ?? 0) + 1 : 1,
      })
      .select('id')
      .single()

    if (insertError || !newPlan) {
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
    }

    lockPlanId = newPlan.id

    // 7. Call Gemini
    const input = buildPlanInput(
      onboardingData,
      startDate,
      validatedLanguage,
      previousPlanSummary,
      validatedFeedback ?? null
    )

    const model = getGeminiModel()
    const systemPrompt = buildSystemPrompt()
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
      systemInstruction: { role: 'model', parts: [{ text: systemPrompt }] },
    })

    const responseText = result.response.text()
    let planOutput: GeminiPlanOutput

    try {
      planOutput = JSON.parse(responseText) as GeminiPlanOutput
    } catch {
      await supabase.from('training_plans').delete().eq('id', newPlan.id)
      return NextResponse.json({ error: 'AI returned invalid response' }, { status: 502 })
    }

    if (!validateGeminiOutput(planOutput)) {
      await supabase.from('training_plans').delete().eq('id', newPlan.id)
      return NextResponse.json({ error: 'AI returned invalid plan structure' }, { status: 502 })
    }

    // 8. Insert training days (with sanitized strings)
    const trainingDays = planOutput.days.map(day => {
      const dayDate = new Date(startDate)
      dayDate.setDate(dayDate.getDate() + day.day_number - 1)
      return {
        plan_id: newPlan.id,
        date: dayDate.toISOString().split('T')[0],
        day_number: day.day_number,
        workout_type: day.workout_type,
        title: truncateString(day.title, MAX_STRING_LENGTH) ?? '',
        description: truncateString(day.description, MAX_STRING_LENGTH) ?? '',
        distance_km: day.distance_km,
        duration_minutes: day.duration_minutes,
        target_pace: truncateString(day.target_pace, MAX_STRING_LENGTH),
        warmup: truncateString(day.warmup, MAX_STRING_LENGTH),
        cooldown: truncateString(day.cooldown, MAX_STRING_LENGTH),
        notes: truncateString(day.notes, MAX_STRING_LENGTH),
      }
    })

    const { error: daysError } = await supabase
      .from('training_days')
      .insert(trainingDays)

    if (daysError) {
      await supabase.from('training_plans').delete().eq('id', newPlan.id)
      console.error('Failed to insert training days:', daysError)
      return NextResponse.json({ error: 'Failed to save training days' }, { status: 500 })
    }

    // 9. Update plan status and handle previous plan
    await supabase
      .from('training_plans')
      .update({
        status: 'active',
        title: truncateString(planOutput.plan_overview.title, MAX_STRING_LENGTH),
        description: truncateString(planOutput.plan_overview.description, MAX_STRING_LENGTH),
        weekly_summary: truncateString(planOutput.plan_overview.weekly_summary, MAX_STRING_LENGTH),
      })
      .eq('id', newPlan.id)

    if (activePlan) {
      if (validatedType === 'new') {
        await supabase
          .from('training_plans')
          .update({ status: 'historical' })
          .eq('id', activePlan.id)
      } else {
        await supabase
          .from('training_plans')
          .delete()
          .eq('id', activePlan.id)
      }
    }

    // 10. Return the complete plan
    const { data: completePlan } = await supabase
      .from('training_plans')
      .select('*')
      .eq('id', newPlan.id)
      .single()

    const { data: completeDays } = await supabase
      .from('training_days')
      .select('*')
      .eq('plan_id', newPlan.id)
      .order('day_number')

    return NextResponse.json({
      success: true,
      plan: completePlan,
      days: completeDays,
    })
  } catch {
    // Clean up the lock record if it was created
    if (lockPlanId && supabase) {
      try {
        await supabase.from('training_plans').delete().eq('id', lockPlanId)
      } catch {
        // Best-effort cleanup
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

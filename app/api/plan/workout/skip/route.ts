import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { SkipWorkoutSchema } from '@/lib/validation/workout'
import { computeAdjustments } from '@/lib/plan/adjustment-algorithm'
import type { TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = SkipWorkoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
    }

    const { training_day_id, reason } = parsed.data

    // Verify training day belongs to user's active plan
    const { data: dayData, error: dayError } = await supabase
      .from('training_days')
      .select('*, training_plans!inner(user_id, status)')
      .eq('id', training_day_id)
      .single()

    if (dayError || !dayData) {
      return NextResponse.json({ error: 'Training day not found' }, { status: 404 })
    }

    const plan = (dayData as Record<string, unknown>).training_plans as { user_id: string; status: string }
    if (plan.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (plan.status !== 'active') {
      return NextResponse.json({ error: 'Plan is not active' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]
    if ((dayData as Record<string, unknown>).date as string > today) {
      return NextResponse.json({ error: 'Cannot skip a future workout' }, { status: 400 })
    }

    // Upsert workout log
    const { data: log, error: logError } = await supabase
      .from('workout_logs')
      .upsert(
        {
          training_day_id,
          user_id: user.id,
          status: 'skipped' as const,
          skip_reason: reason,
          completion_feedback: null,
        },
        { onConflict: 'training_day_id' }
      )
      .select()
      .single()

    if (logError) {
      console.error('Workout log upsert error:', logError)
      return NextResponse.json({ error: 'Failed to save workout log' }, { status: 500 })
    }

    // Build skipped day (without the join field)
    const skippedDay: TrainingDayRow = {
      id: dayData.id as string,
      plan_id: dayData.plan_id as string,
      date: dayData.date as string,
      day_number: dayData.day_number as number,
      workout_type: dayData.workout_type as TrainingDayRow['workout_type'],
      title: dayData.title as string,
      description: dayData.description as string,
      distance_km: dayData.distance_km as number | null,
      duration_minutes: dayData.duration_minutes as number | null,
      target_pace: dayData.target_pace as string | null,
      warmup: dayData.warmup as string | null,
      cooldown: dayData.cooldown as string | null,
      notes: dayData.notes as string | null,
      created_at: dayData.created_at as string,
    }

    // Fetch last 2 training days (before skipped day) with logs
    const { data: prevDays } = await supabase
      .from('training_days')
      .select('*')
      .eq('plan_id', skippedDay.plan_id)
      .lt('day_number', skippedDay.day_number)
      .order('day_number', { ascending: false })
      .limit(2)

    const prevDayRows = (prevDays as TrainingDayRow[] | null) ?? []
    const prevDayIds = prevDayRows.map(d => d.id)

    let prevLogs: WorkoutLogRow[] = []
    if (prevDayIds.length > 0) {
      const { data: logsData } = await supabase
        .from('workout_logs')
        .select('*')
        .in('training_day_id', prevDayIds)

      prevLogs = (logsData as WorkoutLogRow[] | null) ?? []
    }

    const last2Days = prevDayRows.map(day => ({
      day,
      log: prevLogs.find(l => l.training_day_id === day.id) ?? null,
    }))

    // Fetch next 2 training days (after skipped day)
    const { data: nextDays } = await supabase
      .from('training_days')
      .select('*')
      .eq('plan_id', skippedDay.plan_id)
      .gt('day_number', skippedDay.day_number)
      .order('day_number', { ascending: true })
      .limit(2)

    const next2Days = (nextDays as TrainingDayRow[] | null) ?? []

    // Run adjustment algorithm
    const suggestions = computeAdjustments(skippedDay, reason, last2Days, next2Days)

    return NextResponse.json({ success: true, log, suggestions })
  } catch (error) {
    console.error('Skip workout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

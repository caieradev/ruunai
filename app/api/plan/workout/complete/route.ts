import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { CompleteWorkoutSchema } from '@/lib/validation/workout'

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = CompleteWorkoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
    }

    const { training_day_id, feedback } = parsed.data

    // Verify training day belongs to user's active plan and date is today or past
    const { data: dayData, error: dayError } = await supabase
      .from('training_days')
      .select('id, date, plan_id, training_plans!inner(user_id, status)')
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
      return NextResponse.json({ error: 'Cannot complete a future workout' }, { status: 400 })
    }

    // Upsert workout log
    const { data: log, error: logError } = await supabase
      .from('workout_logs')
      .upsert(
        {
          training_day_id,
          user_id: user.id,
          status: 'completed' as const,
          completion_feedback: feedback,
          skip_reason: null,
        },
        { onConflict: 'training_day_id' }
      )
      .select()
      .single()

    if (logError) {
      console.error('Workout log upsert error:', logError)
      return NextResponse.json({ error: 'Failed to save workout log' }, { status: 500 })
    }

    return NextResponse.json({ success: true, log })
  } catch (error) {
    console.error('Complete workout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

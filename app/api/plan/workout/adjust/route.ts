import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { ApplyAdjustmentsSchema } from '@/lib/validation/workout'

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = ApplyAdjustmentsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
    }

    const { adjustments } = parsed.data

    // Verify all training days belong to user's active plan
    const dayIds = adjustments.map(a => a.training_day_id)
    const { data: daysData, error: daysError } = await supabase
      .from('training_days')
      .select('id, plan_id, training_plans!inner(user_id, status)')
      .in('id', dayIds)

    if (daysError || !daysData || daysData.length !== dayIds.length) {
      return NextResponse.json({ error: 'One or more training days not found' }, { status: 404 })
    }

    // Check ownership and active status
    for (const day of daysData) {
      const plan = (day as Record<string, unknown>).training_plans as { user_id: string; status: string }
      if (plan.user_id !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      if (plan.status !== 'active') {
        return NextResponse.json({ error: 'Plan is not active' }, { status: 400 })
      }
    }

    // Apply each adjustment
    const updatedDays = []
    for (const adjustment of adjustments) {
      const { training_day_id, ...updates } = adjustment
      // Filter out undefined values
      const cleanUpdates: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          cleanUpdates[key] = value
        }
      }

      if (Object.keys(cleanUpdates).length === 0) continue

      const { data: updated, error: updateError } = await supabase
        .from('training_days')
        .update(cleanUpdates)
        .eq('id', training_day_id)
        .select()
        .single()

      if (updateError) {
        console.error('Training day update error:', updateError)
        return NextResponse.json({ error: 'Failed to update training day' }, { status: 500 })
      }

      updatedDays.push(updated)
    }

    return NextResponse.json({ success: true, updated_days: updatedDays })
  } catch (error) {
    console.error('Adjust workout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

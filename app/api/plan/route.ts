import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: plan } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!plan) {
      return NextResponse.json({ plan: null, days: [], logs: [] })
    }

    const { data: days } = await supabase
      .from('training_days')
      .select('*')
      .eq('plan_id', plan.id)
      .order('day_number')

    const dayIds = (days ?? []).map((d: { id: string }) => d.id)
    let logs: unknown[] = []
    if (dayIds.length > 0) {
      const { data: logsData } = await supabase
        .from('workout_logs')
        .select('*')
        .in('training_day_id', dayIds)

      logs = logsData ?? []
    }

    return NextResponse.json({ plan, days: days ?? [], logs })
  } catch (error) {
    console.error('Plan fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

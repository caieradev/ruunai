import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

interface RunnerProfile {
  full_name: string | null
  onboarding_completed: boolean
}

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // Get runner profile
    const { data: runner } = await supabase
      .from('runners')
      .select('full_name, onboarding_completed')
      .eq('id', user.id)
      .single()

    const typedRunner = runner as RunnerProfile | null

    // Check if user has responses
    const { count } = await supabase
      .from('runner_responses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Check active plan status
    const { data: activePlan } = await supabase
      .from('training_plans')
      .select('id, status, ends_at, generation_count')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const today = new Date().toISOString().split('T')[0]
    const planExpired = activePlan ? activePlan.ends_at < today : false

    return NextResponse.json({
      id: user.id,
      email: user.email,
      email_confirmed: !!user.email_confirmed_at,
      full_name: typedRunner?.full_name ?? null,
      onboarding_completed: typedRunner?.onboarding_completed ?? false,
      has_responses: (count ?? 0) > 0,
      has_active_plan: !!activePlan,
      plan_expired: planExpired,
      generation_count: activePlan?.generation_count ?? 0,
    })
  } catch (error) {
    console.error('Error in /api/me:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}

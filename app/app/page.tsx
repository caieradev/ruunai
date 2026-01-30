import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import DashboardContent from '@/components/dashboard/DashboardContent'
import type { TrainingPlanRow, TrainingDayRow } from '@/lib/supabase/types'

interface RunnerProfile {
  full_name: string | null
  onboarding_completed: boolean
}

export default async function AppPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login?redirect=/app')
  }

  // Get runner profile
  const { data: runner } = await supabase
    .from('runners')
    .select('full_name, onboarding_completed')
    .eq('id', user.id)
    .single()

  const typedRunner = runner as RunnerProfile | null

  // Redirect to onboarding if not completed
  if (!typedRunner?.onboarding_completed) {
    redirect('/onboarding')
  }

  // Fetch active plan and its training days
  const { data: plan } = await supabase
    .from('training_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const typedPlan = plan as TrainingPlanRow | null

  let days: TrainingDayRow[] = []
  if (typedPlan) {
    const { data: trainingDays } = await supabase
      .from('training_days')
      .select('*')
      .eq('plan_id', typedPlan.id)
      .order('day_number')

    days = (trainingDays as TrainingDayRow[] | null) ?? []
  }

  return (
    <DashboardContent
      fullName={typedRunner?.full_name ?? null}
      initialPlan={typedPlan}
      initialDays={days}
    />
  )
}

import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import PlanPageContent from '@/components/plan/PlanPageContent'
import type { TrainingPlanRow, TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'

export default async function PlanPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/app/plan')

  const { data: runner } = await supabase
    .from('runners')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!(runner as { onboarding_completed: boolean } | null)?.onboarding_completed) {
    redirect('/onboarding')
  }

  const { data: plan } = await supabase
    .from('training_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const typedPlan = plan as TrainingPlanRow | null

  let days: TrainingDayRow[] = []
  let logs: WorkoutLogRow[] = []
  if (typedPlan) {
    const { data: trainingDays } = await supabase
      .from('training_days')
      .select('*')
      .eq('plan_id', typedPlan.id)
      .order('day_number')

    days = (trainingDays as TrainingDayRow[] | null) ?? []

    const dayIds = days.map(d => d.id)
    if (dayIds.length > 0) {
      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('*')
        .in('training_day_id', dayIds)

      logs = (workoutLogs as WorkoutLogRow[] | null) ?? []
    }
  }

  return (
    <PlanPageContent
      initialPlan={typedPlan}
      initialDays={days}
      initialLogs={logs}
    />
  )
}

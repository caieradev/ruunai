import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import DashboardContent from '@/components/dashboard/DashboardContent'
import type { TrainingPlanRow, TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'
import {
  getWeeklyKm,
  getStreak,
  getMonthCompletion,
  getWeekLoad,
  getNext7Days,
  getNextWorkout,
} from '@/lib/plan/utils'
import { getAchievements } from '@/lib/plan/achievements'

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

  // Compute stats server-side
  const weeklyKm = getWeeklyKm(days, logs)
  const streak = getStreak(days, logs)
  const monthCompletion = getMonthCompletion(days, logs)
  const weekLoad = getWeekLoad(days)
  const next7Days = typedPlan
    ? getNext7Days(days, typedPlan.starts_at, typedPlan.ends_at).map(d => ({
        ...d,
        date: d.date.toISOString(),
      }))
    : []
  const nextWorkout = getNextWorkout(days, logs)
  const achievements = getAchievements(days, logs, streak, monthCompletion)

  return (
    <DashboardContent
      fullName={typedRunner?.full_name ?? null}
      initialPlan={typedPlan}
      initialDays={days}
      initialLogs={logs}
      weeklyKm={weeklyKm}
      streak={streak}
      monthCompletion={monthCompletion}
      weekLoad={weekLoad}
      next7Days={next7Days}
      nextWorkout={nextWorkout}
      achievements={achievements}
    />
  )
}

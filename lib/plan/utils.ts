import type { WorkoutType, TrainingPlanRow, TrainingDayRow } from '@/lib/supabase/types'

export function getWorkoutColor(type: WorkoutType): string {
  const colors: Record<WorkoutType, string> = {
    easy_run: 'text-green-400',
    tempo: 'text-yellow-400',
    intervals: 'text-red-400',
    long_run: 'text-blue-400',
    recovery: 'text-emerald-300',
    cross_training: 'text-purple-400',
    race_pace: 'text-orange-400',
  }
  return colors[type] ?? 'text-text-secondary'
}

export function getWorkoutBgColor(type: WorkoutType): string {
  const colors: Record<WorkoutType, string> = {
    easy_run: 'bg-green-400',
    tempo: 'bg-yellow-400',
    intervals: 'bg-red-400',
    long_run: 'bg-blue-400',
    recovery: 'bg-emerald-300',
    cross_training: 'bg-purple-400',
    race_pace: 'bg-orange-400',
  }
  return colors[type] ?? 'bg-dark-muted'
}

export function getWorkoutBgLight(type: WorkoutType): string {
  const colors: Record<WorkoutType, string> = {
    easy_run: 'bg-green-400/20',
    tempo: 'bg-yellow-400/20',
    intervals: 'bg-red-400/20',
    long_run: 'bg-blue-400/20',
    recovery: 'bg-emerald-300/20',
    cross_training: 'bg-purple-400/20',
    race_pace: 'bg-orange-400/20',
  }
  return colors[type] ?? 'bg-dark-muted/20'
}

export function getTodayWorkout(days: TrainingDayRow[]): TrainingDayRow | null {
  const today = new Date().toISOString().split('T')[0]
  return days.find(d => d.date === today) ?? null
}

export function isPlanExpired(plan: TrainingPlanRow): boolean {
  const today = new Date().toISOString().split('T')[0]
  return plan.ends_at < today
}

export function getWeekDays(
  days: TrainingDayRow[],
  planStartDate: string,
  weekOffset: number
): { date: Date, day: TrainingDayRow | null, inPlan: boolean }[] {
  const planStart = new Date(planStartDate + 'T00:00:00')
  const planEnd = new Date(planStart)
  planEnd.setDate(planStart.getDate() + 29)

  // Find the Monday of the week containing the plan start + offset
  const ref = new Date(planStart)
  ref.setDate(planStart.getDate() + weekOffset * 7)
  const refDow = ref.getDay() // 0=Sun
  const mondayOffset = refDow === 0 ? -6 : 1 - refDow
  const monday = new Date(ref)
  monday.setDate(ref.getDate() + mondayOffset)

  const result: { date: Date, day: TrainingDayRow | null, inPlan: boolean }[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const day = days.find(d => d.date === dateStr) ?? null
    const inPlan = date >= planStart && date <= planEnd
    result.push({ date, day, inPlan })
  }
  return result
}

export function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

export function getDayName(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { weekday: 'short' })
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
}

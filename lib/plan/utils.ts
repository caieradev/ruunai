import type { WorkoutType, TrainingPlanRow, TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'

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

export function getWeeklyKm(
  days: TrainingDayRow[],
  logs: WorkoutLogRow[]
): { current: number; previous: number } {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  const twoWeeksAgo = new Date(today)
  twoWeeksAgo.setDate(today.getDate() - 14)
  const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0]

  const completedDayIds = new Set(
    logs.filter(l => l.status === 'completed').map(l => l.training_day_id)
  )

  let current = 0
  let previous = 0
  for (const day of days) {
    if (!completedDayIds.has(day.id)) continue
    if (day.date > weekAgoStr && day.date <= todayStr) {
      current += day.distance_km ?? 0
    } else if (day.date > twoWeeksAgoStr && day.date <= weekAgoStr) {
      previous += day.distance_km ?? 0
    }
  }

  return {
    current: Math.round(current * 10) / 10,
    previous: Math.round(previous * 10) / 10,
  }
}

export function getStreak(
  days: TrainingDayRow[],
  logs: WorkoutLogRow[]
): number {
  const today = new Date().toISOString().split('T')[0]
  const pastDays = days
    .filter(d => d.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))

  const logMap = new Map(logs.map(l => [l.training_day_id, l]))

  let streak = 0
  for (const day of pastDays) {
    const log = logMap.get(day.id)
    if (log?.status === 'completed') {
      streak++
    } else if (log?.status === 'skipped') {
      break
    } else {
      if (day.date === today) continue
      break
    }
  }
  return streak
}

export function getMonthCompletion(
  days: TrainingDayRow[],
  logs: WorkoutLogRow[]
): number {
  if (days.length === 0) return 0
  const completedCount = logs.filter(l => l.status === 'completed').length
  return Math.round((completedCount / days.length) * 100)
}

export type WeekLoad = 'light' | 'moderate' | 'heavy'

export function getWeekLoad(days: TrainingDayRow[]): WeekLoad {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  const weekDays = days.filter(d => d.date > weekAgoStr && d.date <= todayStr)
  if (weekDays.length === 0) return 'light'

  const intense = new Set<WorkoutType>(['intervals', 'tempo', 'race_pace'])
  const intenseCount = weekDays.filter(d => intense.has(d.workout_type)).length
  const ratio = intenseCount / weekDays.length

  if (ratio >= 0.5) return 'heavy'
  if (ratio >= 0.2) return 'moderate'
  return 'light'
}

export function getNext7Days(
  days: TrainingDayRow[],
  planStartDate: string,
  planEndDate: string
): { date: Date; day: TrainingDayRow | null; inPlan: boolean }[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const result: { date: Date; day: TrainingDayRow | null; inPlan: boolean }[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const day = days.find(d => d.date === dateStr) ?? null
    const inPlan = dateStr >= planStartDate && dateStr <= planEndDate
    result.push({ date, day, inPlan })
  }
  return result
}

export function getNextWorkout(
  days: TrainingDayRow[],
  logs: WorkoutLogRow[]
): TrainingDayRow | null {
  const today = new Date().toISOString().split('T')[0]
  const loggedIds = new Set(logs.map(l => l.training_day_id))

  return days
    .filter(d => d.date > today && !loggedIds.has(d.id))
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
}

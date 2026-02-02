import type { TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'

export interface Achievement {
  id: string
  icon: string
  unlocked: boolean
}

const VOLUME_THRESHOLDS = [
  { id: 'first5k', threshold: 5 },
  { id: 'first10k', threshold: 10 },
  { id: 'first21k', threshold: 21 },
] as const

const STREAK_THRESHOLDS = [
  { id: 'streak3', threshold: 3 },
  { id: 'streak5', threshold: 5 },
  { id: 'streak10', threshold: 10 },
  { id: 'streak30', threshold: 30 },
] as const

export function getAchievements(
  days: TrainingDayRow[],
  logs: WorkoutLogRow[],
  streak: number,
  monthCompletion: number
): Achievement[] {
  const completedDayIds = new Set(
    logs.filter(l => l.status === 'completed').map(l => l.training_day_id)
  )

  const completedDays = days.filter(d => completedDayIds.has(d.id))
  const maxDistance = Math.max(0, ...completedDays.map(d => d.distance_km ?? 0))

  const achievements: Achievement[] = []

  // Volume-based
  for (const { id, threshold } of VOLUME_THRESHOLDS) {
    achievements.push({ id, icon: 'route', unlocked: maxDistance >= threshold })
  }

  // Streak-based
  const maxStreak = getMaxStreak(days, logs)
  for (const { id, threshold } of STREAK_THRESHOLDS) {
    achievements.push({ id, icon: 'flame', unlocked: maxStreak >= threshold })
  }

  // Completion-based
  achievements.push({
    id: 'month50',
    icon: 'target',
    unlocked: monthCompletion >= 50,
  })
  achievements.push({
    id: 'month100',
    icon: 'trophy',
    unlocked: monthCompletion >= 100,
  })

  // Consistency-based
  const hasFullWeek = checkFullWeek(days, logs)
  achievements.push({ id: 'firstWeek', icon: 'calendar-check', unlocked: hasFullWeek })
  achievements.push({ id: 'firstMonth', icon: 'award', unlocked: monthCompletion >= 100 })

  return achievements
}

function getMaxStreak(days: TrainingDayRow[], logs: WorkoutLogRow[]): number {
  const today = new Date().toISOString().split('T')[0]
  const pastDays = days.filter(d => d.date <= today).sort((a, b) => a.date.localeCompare(b.date))
  const logMap = new Map(logs.map(l => [l.training_day_id, l]))

  let maxStreak = 0
  let current = 0

  for (const day of pastDays) {
    const log = logMap.get(day.id)
    if (log?.status === 'completed') {
      current++
      maxStreak = Math.max(maxStreak, current)
    } else if (log?.status === 'skipped') {
      current = 0
    }
  }

  return maxStreak
}

function checkFullWeek(days: TrainingDayRow[], logs: WorkoutLogRow[]): boolean {
  const completedDates = new Set<string>()
  const logMap = new Map(logs.map(l => [l.training_day_id, l]))

  for (const day of days) {
    if (logMap.get(day.id)?.status === 'completed') {
      completedDates.add(day.date)
    }
  }

  const trainingDates = new Set(days.map(d => d.date))

  if (days.length === 0) return false
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  const startDate = new Date(sorted[0].date + 'T00:00:00')

  for (let offset = 0; offset <= 23; offset++) {
    const windowStart = new Date(startDate)
    windowStart.setDate(startDate.getDate() + offset)
    let allCompleted = true
    let hasTraining = false

    for (let d = 0; d < 7; d++) {
      const checkDate = new Date(windowStart)
      checkDate.setDate(windowStart.getDate() + d)
      const dateStr = checkDate.toISOString().split('T')[0]

      if (trainingDates.has(dateStr)) {
        hasTraining = true
        if (!completedDates.has(dateStr)) {
          allCompleted = false
          break
        }
      }
    }

    if (hasTraining && allCompleted) return true
  }

  return false
}

import type {
  TrainingDayRow,
  WorkoutLogRow,
  WorkoutAdjustment,
  SkipReason,
  WorkoutType,
} from '@/lib/supabase/types'

interface DayWithLog {
  day: TrainingDayRow
  log: WorkoutLogRow | null
}

const HARD_WORKOUT_TYPES: WorkoutType[] = ['tempo', 'intervals', 'long_run', 'race_pace']
const DOWNGRADE_MAP: Partial<Record<WorkoutType, WorkoutType>> = {
  tempo: 'easy_run',
  intervals: 'easy_run',
  long_run: 'easy_run',
  race_pace: 'easy_run',
}
const DOWNGRADE_TO_RECOVERY_MAP: Partial<Record<WorkoutType, WorkoutType>> = {
  tempo: 'recovery',
  intervals: 'recovery',
  long_run: 'recovery',
  race_pace: 'recovery',
  easy_run: 'recovery',
}

function isHardWorkout(type: WorkoutType): boolean {
  return HARD_WORKOUT_TYPES.includes(type)
}

function reduceDistance(day: TrainingDayRow, pct: number): number | null {
  if (day.distance_km == null) return null
  return Math.round(Number(day.distance_km) * (1 - pct) * 10) / 10
}

function reduceDuration(day: TrainingDayRow, pct: number): number | null {
  if (day.duration_minutes == null) return null
  return Math.round(day.duration_minutes * (1 - pct))
}

function slowPace(pace: string | null, secondsPerKm: number): string | null {
  if (!pace) return null
  // Parse "M:SS/km" or "MM:SS/km" format
  const match = pace.match(/^(\d+):(\d{2})\/km$/)
  if (!match) return pace
  const totalSeconds = parseInt(match[1]) * 60 + parseInt(match[2]) + secondsPerKm
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}/km`
}

function makeAdjustment(
  day: TrainingDayRow,
  overrides: Partial<Pick<WorkoutAdjustment, 'workout_type' | 'distance_km' | 'duration_minutes' | 'target_pace'>>
): WorkoutAdjustment {
  const adj: WorkoutAdjustment = { training_day_id: day.id }
  if (overrides.workout_type !== undefined) adj.workout_type = overrides.workout_type
  if (overrides.distance_km !== undefined) adj.distance_km = overrides.distance_km
  if (overrides.duration_minutes !== undefined) adj.duration_minutes = overrides.duration_minutes
  if (overrides.target_pace !== undefined) adj.target_pace = overrides.target_pace
  return adj
}

/**
 * Pure function: computes suggested adjustments for upcoming workouts
 * when a user skips a training day.
 *
 * Rules (first match wins):
 * 1. INJURY → downgrade hard→easy_run, -30% distance, -20% duration
 * 2. SICK → downgrade hard→recovery, -40% distance, -30% duration
 * 3. TOO_HARD + recent pattern → keep types, -20% distance, slow pace 30s/km
 * 4. Hard skipped + easy next → mild: -15% distance on first day only
 * 5. Consecutive skips (2+) → downgrade hard→easy_run, -25% distance
 * 6. Easy skipped + hard next → no change
 * 7. TOO_TIRED/NO_TIME + hard next → -10% distance
 * 8. WEATHER/OTHER → no change
 */
export function computeAdjustments(
  skippedDay: TrainingDayRow,
  skipReason: SkipReason,
  last2Days: DayWithLog[],
  next2Days: TrainingDayRow[]
): WorkoutAdjustment[] {
  if (next2Days.length === 0) return []

  // Rule 1: INJURY
  if (skipReason === 'INJURY') {
    return next2Days.map(day => {
      const newType = isHardWorkout(day.workout_type)
        ? DOWNGRADE_MAP[day.workout_type] ?? day.workout_type
        : day.workout_type
      return makeAdjustment(day, {
        workout_type: newType !== day.workout_type ? newType : undefined,
        distance_km: reduceDistance(day, 0.3),
        duration_minutes: reduceDuration(day, 0.2),
      })
    }).filter(adj => Object.keys(adj).length > 1)
  }

  // Rule 2: SICK
  if (skipReason === 'SICK') {
    return next2Days.map(day => {
      const newType = DOWNGRADE_TO_RECOVERY_MAP[day.workout_type] ?? day.workout_type
      return makeAdjustment(day, {
        workout_type: newType !== day.workout_type ? newType : undefined,
        distance_km: reduceDistance(day, 0.4),
        duration_minutes: reduceDuration(day, 0.3),
      })
    }).filter(adj => Object.keys(adj).length > 1)
  }

  // Rule 3: TOO_HARD + pattern (recent FELT_HARD or TOO_HARD skip)
  if (skipReason === 'TOO_HARD') {
    const hasRecentHardPattern = last2Days.some(
      dl => dl.log && (
        dl.log.completion_feedback === 'FELT_HARD' ||
        dl.log.skip_reason === 'TOO_HARD'
      )
    )
    if (hasRecentHardPattern) {
      return next2Days.map(day =>
        makeAdjustment(day, {
          distance_km: reduceDistance(day, 0.2),
          target_pace: slowPace(day.target_pace, 30),
        })
      ).filter(adj => Object.keys(adj).length > 1)
    }
  }

  // Rule 4: Hard skipped + easy/recovery next
  if (isHardWorkout(skippedDay.workout_type)) {
    const firstNext = next2Days[0]
    if (firstNext && !isHardWorkout(firstNext.workout_type)) {
      const adj = makeAdjustment(firstNext, {
        distance_km: reduceDistance(firstNext, 0.15),
      })
      return Object.keys(adj).length > 1 ? [adj] : []
    }
  }

  // Rule 5: Consecutive skips (2+ recent skips)
  const recentSkipCount = last2Days.filter(
    dl => dl.log?.status === 'skipped'
  ).length
  if (recentSkipCount >= 2) {
    return next2Days.map(day => {
      const newType = isHardWorkout(day.workout_type)
        ? DOWNGRADE_MAP[day.workout_type] ?? day.workout_type
        : day.workout_type
      return makeAdjustment(day, {
        workout_type: newType !== day.workout_type ? newType : undefined,
        distance_km: reduceDistance(day, 0.25),
      })
    }).filter(adj => Object.keys(adj).length > 1)
  }

  // Rule 6: Easy skipped + hard next → no change
  if (!isHardWorkout(skippedDay.workout_type) && next2Days.some(d => isHardWorkout(d.workout_type))) {
    return []
  }

  // Rule 7: TOO_TIRED or NO_TIME + hard next
  if (skipReason === 'TOO_TIRED' || skipReason === 'NO_TIME') {
    const hardNext = next2Days.filter(d => isHardWorkout(d.workout_type))
    if (hardNext.length > 0) {
      return hardNext.map(day =>
        makeAdjustment(day, {
          distance_km: reduceDistance(day, 0.1),
        })
      ).filter(adj => Object.keys(adj).length > 1)
    }
  }

  // Rule 8: WEATHER/OTHER → no change
  return []
}

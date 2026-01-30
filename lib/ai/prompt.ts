import type { OnboardingData } from '@/lib/onboarding/types'
import type { PlanFeedback, TrainingDayRow } from '@/lib/supabase/types'
import type { GeminiPlanInput, PreviousPlanSummary } from './types'

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return DAYS_OF_WEEK[date.getDay()]
}

function buildDayNumberToWeekdayMap(startDate: string): Record<number, string> {
  const map: Record<number, string> = {}
  const start = new Date(startDate + 'T00:00:00')
  for (let i = 0; i < 30; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    map[i + 1] = DAYS_OF_WEEK[d.getDay()]
  }
  return map
}

function buildTrainingDayNumbers(startDate: string, preferredDays?: string[]): number[] {
  if (!preferredDays || preferredDays.length === 0) return []
  const preferred = new Set(preferredDays.map(d => d.toLowerCase()))
  const result: number[] = []
  const start = new Date(startDate + 'T00:00:00')
  for (let i = 0; i < 30; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (preferred.has(DAYS_OF_WEEK[d.getDay()])) {
      result.push(i + 1)
    }
  }
  return result
}

export function buildPlanInput(
  onboardingData: OnboardingData,
  startDate: string,
  language: string,
  previousPlanSummary: PreviousPlanSummary | null,
  feedback: PlanFeedback | null
): GeminiPlanInput {
  return {
    runner_profile: {
      goal: onboardingData.goal!,
      event_date: onboardingData.eventDate,
      target_time: onboardingData.targetTime,
      target_pace: onboardingData.targetPace,
      experience_level: onboardingData.experienceLevel!,
      can_run_20_mins_continuously: onboardingData.canRun20MinsContinuously,
      recent_best_5k: onboardingData.recentBest5K,
      recent_best_10k: onboardingData.recentBest10K,
      recent_easy_pace: onboardingData.recentEasyPace,
      weekly_volume: onboardingData.weeklyVolume!,
      days_per_week: onboardingData.daysPerWeek!,
      preferred_days: onboardingData.preferredDays,
      longest_recent_run: onboardingData.longestRecentRun,
      no_recent_run: onboardingData.noRecentRun,
      injury_types: onboardingData.injuryTypes!,
      injury_details: onboardingData.injuryDetails,
      equipment: onboardingData.equipment,
      plan_style: onboardingData.planStyle!,
      plan_flexibility: onboardingData.planFlexibility!,
      intensity_tolerance: onboardingData.intensityTolerance!,
    },
    plan_config: {
      start_date: startDate,
      start_day_of_week: getDayOfWeek(startDate),
      duration_days: 30,
      language,
      day_number_to_weekday: buildDayNumberToWeekdayMap(startDate),
      training_day_numbers: buildTrainingDayNumbers(startDate, onboardingData.preferredDays),
    },
    previous_plan_summary: previousPlanSummary,
    feedback,
  }
}

export function buildPreviousPlanSummary(
  plan: { title: string | null },
  days: TrainingDayRow[]
): PreviousPlanSummary {
  const totalDistance = days.reduce((sum, d) => sum + (d.distance_km ?? 0), 0)
  const typeDistribution: Record<string, number> = {}
  for (const day of days) {
    typeDistribution[day.workout_type] = (typeDistribution[day.workout_type] ?? 0) + 1
  }

  const weeklyVolumes: number[] = [0, 0, 0, 0, 0]
  for (const day of days) {
    const weekIndex = Math.min(Math.floor((day.day_number - 1) / 7), 4)
    weeklyVolumes[weekIndex] += day.distance_km ?? 0
  }

  return {
    total_distance_km: Math.round(totalDistance * 10) / 10,
    total_training_days: days.length,
    workout_type_distribution: typeDistribution,
    weekly_volumes_km: weeklyVolumes.map(v => Math.round(v * 10) / 10),
    plan_title: plan.title ?? 'Previous Plan',
  }
}

export function buildSystemPrompt(): string {
  return `You are an expert running coach AI. You create personalized 30-day training plans.

CRITICAL — TRAINING DAY SELECTION:
- The input includes "plan_config.training_day_numbers" — this is the PRE-CALCULATED list of day_number values that fall on the runner's preferred weekdays.
- You MUST ONLY use day_number values from this list. Do NOT assign workouts to any other day_number.
- The input also includes "plan_config.day_number_to_weekday" which maps every day_number (1-30) to its weekday. Use this to verify your output.
- Example: if training_day_numbers is [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29], your "days" array must ONLY contain entries with those day_number values.

RULES:
- Generate a JSON training plan following the exact schema provided.
- Only include training days in the "days" array. Do NOT include rest days — any day not in the array is automatically a rest day.
- day_number starts at 1 (first day of the plan) and goes up to 30.
- Adapt intensity to the runner's experience_level and intensity_tolerance.
- Account for injuries by avoiding aggravating workouts and including injury-prevention notes.
- workout_type must be one of: easy_run, tempo, intervals, long_run, recovery, cross_training, race_pace
- All text content MUST be in the language specified in plan_config.language.
- If previous_plan_summary is provided, create a plan that builds on it with slight variations for progression and adaptability.
- If feedback is provided, adjust the plan based on the runner's feedback (difficulty, volume, variety, injuries, comments).
- Include progressive overload: gradually increase volume/intensity across the 4 weeks.
- Include a recovery/taper in the last few days if appropriate.
- Be specific with paces, distances, warmup/cooldown instructions.

OUTPUT SCHEMA:
{
  "plan_overview": {
    "title": "string - plan name",
    "description": "string - 2-3 sentence plan description",
    "weekly_summary": "string - brief weekly structure overview"
  },
  "days": [
    {
      "day_number": "integer - MUST be from training_day_numbers",
      "workout_type": "string - one of the allowed types",
      "title": "string - workout name",
      "description": "string - detailed workout description",
      "distance_km": "number - distance in km (optional)",
      "duration_minutes": "integer - estimated duration (optional)",
      "target_pace": "string - pace range like '5:30-6:00 /km' (optional)",
      "warmup": "string - warmup instructions (optional)",
      "cooldown": "string - cooldown instructions (optional)",
      "notes": "string - additional notes (optional)"
    }
  ]
}`
}

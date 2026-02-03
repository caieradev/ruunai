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

function* combinations(arr: number[], k: number, start = 0, current: number[] = []): Generator<number[]> {
  if (current.length === k) { yield [...current]; return }
  for (let i = start; i <= arr.length - (k - current.length); i++) {
    current.push(arr[i])
    yield* combinations(arr, k, i + 1, current)
    current.pop()
  }
}

function selectOptimalDays(preferredDays: string[], daysPerWeek: number): string[] {
  if (preferredDays.length <= daysPerWeek) return preferredDays

  const indices = preferredDays.map(d =>
    DAYS_OF_WEEK.indexOf(d.toLowerCase() as (typeof DAYS_OF_WEEK)[number])
  )

  let bestCombo = indices.slice(0, daysPerWeek)
  let bestMinGap = -1

  for (const combo of combinations(indices, daysPerWeek)) {
    const sorted = [...combo].sort((a, b) => a - b)
    let minGap = Infinity
    for (let i = 0; i < sorted.length; i++) {
      const nextIdx = (i + 1) % sorted.length
      const gap = nextIdx === 0
        ? 7 - sorted[sorted.length - 1] + sorted[0]
        : sorted[nextIdx] - sorted[i]
      minGap = Math.min(minGap, gap)
    }
    if (minGap > bestMinGap) {
      bestMinGap = minGap
      bestCombo = combo
    }
  }

  return bestCombo.map(i => DAYS_OF_WEEK[i])
}

function buildTrainingDayNumbers(startDate: string, preferredDays?: string[], daysPerWeek?: number): number[] {
  if (!preferredDays || preferredDays.length === 0) return []

  const selectedDays = daysPerWeek && daysPerWeek < preferredDays.length
    ? selectOptimalDays(preferredDays, daysPerWeek)
    : preferredDays

  const preferred = new Set(selectedDays.map(d => d.toLowerCase()))
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
      training_day_numbers: buildTrainingDayNumbers(startDate, onboardingData.preferredDays, onboardingData.daysPerWeek),
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
  return `You are an expert running coach AI. You create personalized 30-day training plans that are part of a larger periodized training program.

PERIODIZATION & CONTINUITY:
- Every plan is ONE PHASE (30 days) of a longer training program aligned with the runner's goal.
- Analyze runner_profile.goal and runner_profile.event_date to determine the training context:
  - Calculate the number of weeks between plan_config.start_date and event_date.
  - Estimate the total number of 30-day phases needed to reach the goal.
  - Assign the appropriate phase based on whether previous_plan_summary exists (if it does, this is a continuation; if not, this is phase 1).
- Standard periodization phases for race goals:
  - "Base Building" — build aerobic base, increase mileage gradually, mostly easy runs.
  - "Build" — introduce tempo and intervals, increase intensity while maintaining volume.
  - "Peak" — highest intensity and volume, race-specific workouts.
  - "Taper" — reduce volume 2-3 weeks before the event, maintain intensity.
- For GENERAL_FITNESS goal (no event_date): use "Conditioning" as phase_name. Each plan is phase N of an ongoing program. total_phases_estimate should be 0 to indicate continuous/ongoing.
- The plan description MUST clearly explain what phase this is, what the runner achieved so far (if previous_plan_summary exists), and what to expect in subsequent phases. The runner must understand this is NOT their entire program — more plans will follow to reach their goal.
- If phase_number equals 1 and previous_plan_summary is null, the description should introduce the full training journey ahead.

TRAINING DAY SELECTION:
- "plan_config.training_day_numbers" is the PRE-CALCULATED list of day_number values where the runner should train. These already match the runner's days_per_week preference and preferred weekdays.
- You MUST assign workouts to ALL day_numbers in training_day_numbers. Do NOT skip days and do NOT assign workouts to day_numbers outside this list.
- The ONLY exception: you MAY skip some training_day_numbers if:
  - The runner is a beginner with low weekly volume and you assess overload risk.
  - Feedback indicates the runner found the previous plan too hard or got injured.
  - The plan is in a taper/recovery phase.
  - If you skip days, you MUST explain WHY in the plan description.
- Use "plan_config.day_number_to_weekday" to verify which weekday each day_number corresponds to.

WORKOUT DATA — ALL FIELDS REQUIRED:
- Every workout in the "days" array MUST include distance_km, duration_minutes, AND target_pace. No exceptions.
- distance_km: the total distance for the session in kilometers (number, e.g. 8.0). For cross_training, use 0.
- duration_minutes: the total estimated duration in minutes (integer, e.g. 45). Always required.
- target_pace: MUST be a numeric pace string in one of these formats:
  - Single pace: "5:30 /km"
  - Pace range: "5:30-6:00 /km"
  - For interval workouts: use the pace for the fast intervals (e.g. "4:30-4:45 /km")
  - For cross_training: use "N/A"
  - NEVER use descriptive text like "comfortable", "easy effort", "conversational pace". Always use numeric min:sec format.

GENERAL RULES:
- Generate a JSON training plan following the exact schema provided.
- Only include training days in the "days" array. Do NOT include rest days — any day not in the array is automatically a rest day.
- day_number starts at 1 (first day of the plan) and goes up to 30.
- Adapt intensity to the runner's experience_level and intensity_tolerance.
- Account for injuries by avoiding aggravating workouts and including injury-prevention notes.
- workout_type must be one of: easy_run, tempo, intervals, long_run, recovery, cross_training, race_pace
- All text content MUST be in the language specified in plan_config.language.
- If previous_plan_summary is provided, create a plan that builds on it with progression appropriate to the current phase.
- If feedback is provided, adjust the plan based on the runner's feedback (difficulty, volume, variety, injuries, comments).
- Include progressive overload within the 30-day phase: gradually increase volume/intensity across the 4 weeks.
- Include recovery days/weeks as appropriate for the training phase.
- Be specific with paces, distances, warmup/cooldown instructions.

OUTPUT SCHEMA:
{
  "plan_overview": {
    "title": "string - plan name including phase context (e.g. 'Half Marathon Prep — Base Building')",
    "description": "string - 3-5 sentences explaining: what phase this is, its purpose, what comes next. Must set expectations for the full training journey.",
    "weekly_summary": "string - brief weekly structure overview for this 30-day phase",
    "phase_name": "string - one of: 'Base Building', 'Build', 'Peak', 'Taper', 'Conditioning'",
    "phase_number": "integer - which phase this is (1, 2, 3, ...)",
    "total_phases_estimate": "integer - estimated total phases to reach the goal (0 for GENERAL_FITNESS = ongoing)"
  },
  "days": [
    {
      "day_number": "integer - MUST be from training_day_numbers",
      "workout_type": "string - one of the allowed types",
      "title": "string - workout name",
      "description": "string - detailed workout description",
      "distance_km": "number - REQUIRED - total distance in km (0 for cross_training)",
      "duration_minutes": "integer - REQUIRED - estimated total duration in minutes",
      "target_pace": "string - REQUIRED - pace in 'X:XX /km' or 'X:XX-X:XX /km' format ('N/A' for cross_training only)",
      "warmup": "string - warmup instructions (optional)",
      "cooldown": "string - cooldown instructions (optional)",
      "notes": "string - additional notes (optional)"
    }
  ]
}`
}

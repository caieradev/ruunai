import type { PlanFeedback } from '@/lib/supabase/types'

export interface GeminiPlanInput {
  runner_profile: {
    goal: string
    event_date?: string
    target_time?: string
    target_pace?: string
    experience_level: string
    can_run_20_mins_continuously?: boolean
    recent_best_5k?: string
    recent_best_10k?: string
    recent_easy_pace?: string
    weekly_volume: string
    days_per_week: number
    preferred_days?: string[]
    longest_recent_run?: number
    no_recent_run?: boolean
    injury_types: string[]
    injury_details?: string
    equipment?: string[]
    plan_style: string
    plan_flexibility: string
    intensity_tolerance: string
  }
  plan_config: {
    start_date: string
    start_day_of_week: string
    duration_days: 30
    language: string
    day_number_to_weekday: Record<number, string>
    training_day_numbers: number[]
  }
  previous_plan_summary: PreviousPlanSummary | null
  feedback: PlanFeedback | null
}

export interface PreviousPlanSummary {
  total_distance_km: number
  total_training_days: number
  workout_type_distribution: Record<string, number>
  weekly_volumes_km: number[]
  plan_title: string
}

export interface GeminiPlanOutput {
  plan_overview: {
    title: string
    description: string
    weekly_summary: string
  }
  days: GeminiDayOutput[]
}

export interface GeminiDayOutput {
  day_number: number
  workout_type: string
  title: string
  description: string
  distance_km?: number
  duration_minutes?: number
  target_pace?: string
  warmup?: string
  cooldown?: string
  notes?: string
}

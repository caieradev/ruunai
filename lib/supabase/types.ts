import type { OnboardingData } from '@/lib/onboarding/types'

export type OnboardingPayload = OnboardingData

export interface Database {
  public: {
    Tables: {
      runners: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          onboarding_completed: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          onboarding_completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          onboarding_completed?: boolean
        }
      }
      runner_responses: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          payload: OnboardingPayload
          version: number
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          payload: OnboardingPayload
          version?: number
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          payload?: OnboardingPayload
          version?: number
        }
      }
    }
  }
}

export type PlanStatus = 'generating' | 'active' | 'historical'

export type WorkoutType = 'easy_run' | 'tempo' | 'intervals' | 'long_run' | 'recovery' | 'cross_training' | 'race_pace'

export type FeedbackDifficulty = 'TOO_EASY' | 'ADEQUATE' | 'TOO_HARD'
export type FeedbackVolume = 'WANTED_MORE' | 'GOOD' | 'TOO_MUCH'
export type FeedbackVariety = 'WANTED_MORE' | 'GOOD' | 'TOO_MUCH'
export type FeedbackInjuries = 'NO_ISSUES' | 'HAD_DISCOMFORT' | 'GOT_INJURED'

export interface PlanFeedback {
  difficulty: FeedbackDifficulty
  volume: FeedbackVolume
  variety: FeedbackVariety
  injuries: FeedbackInjuries
  comments?: string
}

export interface TrainingPlanRow {
  id: string
  user_id: string
  status: PlanStatus
  title: string | null
  description: string | null
  weekly_summary: string | null
  language: string
  starts_at: string
  ends_at: string
  feedback: PlanFeedback | null
  previous_plan_id: string | null
  generation_count: number
  created_at: string
  updated_at: string
}

export interface TrainingPlanInsert {
  user_id: string
  status?: PlanStatus
  title?: string
  description?: string
  weekly_summary?: string
  language: string
  starts_at: string
  ends_at: string
  feedback?: PlanFeedback
  previous_plan_id?: string
  generation_count?: number
}

export interface TrainingDayRow {
  id: string
  plan_id: string
  date: string
  day_number: number
  workout_type: WorkoutType
  title: string
  description: string
  distance_km: number | null
  duration_minutes: number | null
  target_pace: string | null
  warmup: string | null
  cooldown: string | null
  notes: string | null
  created_at: string
}

export interface TrainingDayInsert {
  plan_id: string
  date: string
  day_number: number
  workout_type: WorkoutType
  title: string
  description: string
  distance_km?: number
  duration_minutes?: number
  target_pace?: string
  warmup?: string
  cooldown?: string
  notes?: string
}

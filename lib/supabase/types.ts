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

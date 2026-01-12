export type Goal = '5K' | '10K' | 'HALF_MARATHON' | 'MARATHON' | 'GENERAL_FITNESS'
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type WeeklyVolume = '0_5' | '5_15' | '15_30' | '30_50' | '50_PLUS'
export type InjuryType = 'NONE' | 'KNEE' | 'SHIN' | 'FOOT' | 'OTHER'
export type PlanStyle = 'TIME_BASED' | 'DISTANCE_BASED'
export type PlanFlexibility = 'STRUCTURED' | 'FLEXIBLE'
export type IntensityTolerance = 'LOW' | 'MEDIUM' | 'HIGH'

export interface OnboardingData {
  // Step 1: Goal
  goal?: Goal

  // Step 2 (conditional): Event details
  eventDate?: string
  targetTime?: string
  targetPace?: string

  // Step 3: Experience level
  experienceLevel?: ExperienceLevel

  // Step 4 (conditional for beginners): Run/walk comfort
  canRun20MinsContinuously?: boolean

  // Step 5 (conditional for advanced): Recent workouts
  recentBest5K?: string
  recentBest10K?: string
  recentEasyPace?: string

  // Step 6: Weekly running volume
  weeklyVolume?: WeeklyVolume

  // Step 7: Days available per week
  daysPerWeek?: number

  // Step 8: Preferred training days
  preferredDays?: string[]

  // Step 9: Longest recent run
  longestRecentRun?: number
  noRecentRun?: boolean

  // Step 10: Injuries/limitations
  injuryTypes?: InjuryType[]
  injuryDetails?: string

  // Step 11: Equipment access
  equipment?: string[]

  // Step 12: Plan preferences
  planStyle?: PlanStyle
  planFlexibility?: PlanFlexibility
  intensityTolerance?: IntensityTolerance
}

export type StepId =
  | 'goal'
  | 'event-details'
  | 'experience'
  | 'beginner-comfort'
  | 'advanced-fitness'
  | 'weekly-volume'
  | 'days-per-week'
  | 'preferred-days'
  | 'longest-run'
  | 'injuries'
  | 'equipment'
  | 'plan-preferences'
  | 'review'

export interface StepConfig {
  id: StepId
  title: string
  description: string
  isConditional?: boolean
  shouldShow?: (data: OnboardingData) => boolean
}

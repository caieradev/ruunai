import { z } from 'zod'

export const GoalSchema = z.enum(['5K', '10K', 'HALF_MARATHON', 'MARATHON', 'GENERAL_FITNESS'])
export const ExperienceLevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
export const WeeklyVolumeSchema = z.enum(['0_5', '5_15', '15_30', '30_50', '50_PLUS'])
export const InjuryTypeSchema = z.enum(['NONE', 'KNEE', 'SHIN', 'FOOT', 'OTHER'])
export const PlanStyleSchema = z.enum(['TIME_BASED', 'DISTANCE_BASED'])
export const PlanFlexibilitySchema = z.enum(['STRUCTURED', 'FLEXIBLE'])
export const IntensityToleranceSchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])

export const OnboardingDataSchema = z.object({
  // Required fields
  goal: GoalSchema,
  experienceLevel: ExperienceLevelSchema,
  weeklyVolume: WeeklyVolumeSchema,
  daysPerWeek: z.number().min(1).max(7),
  injuryTypes: z.array(InjuryTypeSchema).min(1),
  planStyle: PlanStyleSchema,
  planFlexibility: PlanFlexibilitySchema,
  intensityTolerance: IntensityToleranceSchema,

  // Conditional/optional fields
  eventDate: z.string().optional(),
  targetTime: z.string().optional(),
  targetPace: z.string().optional(),
  canRun20MinsContinuously: z.boolean().optional(),
  recentBest5K: z.string().optional(),
  recentBest10K: z.string().optional(),
  recentEasyPace: z.string().optional(),
  preferredDays: z.array(z.string()).optional(),
  longestRecentRun: z.number().optional(),
  noRecentRun: z.boolean().optional(),
  injuryDetails: z.string().optional(),
  equipment: z.array(z.string()).optional(),
})

export const SubmitOnboardingSchema = z.object({
  payload: OnboardingDataSchema,
})

export type ValidatedOnboardingData = z.infer<typeof OnboardingDataSchema>

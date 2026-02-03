import { z } from 'zod'

export const CompletionFeedbackSchema = z.enum(['FELT_EASY', 'FELT_ADEQUATE', 'FELT_HARD'])
export const SkipReasonSchema = z.enum(['TOO_TIRED', 'INJURY', 'NO_TIME', 'TOO_HARD', 'WEATHER', 'SICK', 'OTHER'])

export const CompleteWorkoutSchema = z.object({
  training_day_id: z.string().uuid(),
  feedback: CompletionFeedbackSchema,
})

export const SkipWorkoutSchema = z.object({
  training_day_id: z.string().uuid(),
  reason: SkipReasonSchema,
})

const AdjustmentItemSchema = z.object({
  training_day_id: z.string().uuid(),
  workout_type: z.enum(['easy_run', 'tempo', 'intervals', 'long_run', 'recovery', 'cross_training', 'race_pace']).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  distance_km: z.number().nullable().optional(),
  duration_minutes: z.number().int().nullable().optional(),
  target_pace: z.string().nullable().optional(),
})

export const ApplyAdjustmentsSchema = z.object({
  adjustments: z.array(AdjustmentItemSchema).min(1),
})

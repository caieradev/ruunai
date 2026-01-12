import { StepConfig, OnboardingData, StepId } from './types'

export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: 'goal',
    title: 'What\'s your running goal?',
    description: 'Help us understand what you\'re training for',
  },
  {
    id: 'event-details',
    title: 'Tell us about your event',
    description: 'Optional: Add your event date and target time',
    isConditional: true,
    shouldShow: (data) => data.goal !== 'GENERAL_FITNESS',
  },
  {
    id: 'experience',
    title: 'What\'s your experience level?',
    description: 'This helps us tailor your training intensity',
  },
  {
    id: 'beginner-comfort',
    title: 'Can you run continuously?',
    description: 'Let\'s assess your current baseline',
    isConditional: true,
    shouldShow: (data) => data.experienceLevel === 'BEGINNER',
  },
  {
    id: 'advanced-fitness',
    title: 'Share your recent performance',
    description: 'Help us set the right training zones',
    isConditional: true,
    shouldShow: (data) => data.experienceLevel === 'ADVANCED',
  },
  {
    id: 'weekly-volume',
    title: 'Current weekly running volume',
    description: 'How many kilometers do you run per week?',
  },
  {
    id: 'days-per-week',
    title: 'How many days can you train?',
    description: 'Select your weekly training availability',
  },
  {
    id: 'preferred-days',
    title: 'Preferred training days',
    description: 'Optional: Choose which days work best for you',
  },
  {
    id: 'longest-run',
    title: 'Longest recent run',
    description: 'What\'s the farthest you\'ve run recently?',
  },
  {
    id: 'injuries',
    title: 'Any injuries or limitations?',
    description: 'Help us keep your training safe',
  },
  {
    id: 'equipment',
    title: 'What equipment do you have access to?',
    description: 'Optional: Tell us about your training environment',
  },
  {
    id: 'plan-preferences',
    title: 'Training plan preferences',
    description: 'Customize how your plan is structured',
  },
  {
    id: 'review',
    title: 'Review your profile',
    description: 'Confirm your information before we generate your plan',
  },
]

export function getVisibleSteps(data: OnboardingData): StepConfig[] {
  return ONBOARDING_STEPS.filter(
    (step) => !step.isConditional || (step.shouldShow && step.shouldShow(data))
  )
}

export function getStepNumber(stepId: StepId, data: OnboardingData): number {
  const visibleSteps = getVisibleSteps(data)
  return visibleSteps.findIndex((s) => s.id === stepId) + 1
}

export function getTotalSteps(data: OnboardingData): number {
  return getVisibleSteps(data).length
}

export function getNextStep(currentStepId: StepId, data: OnboardingData): StepId | null {
  const visibleSteps = getVisibleSteps(data)
  const currentIndex = visibleSteps.findIndex((s) => s.id === currentStepId)
  const nextStep = visibleSteps[currentIndex + 1]
  return nextStep ? nextStep.id : null
}

export function getPreviousStep(currentStepId: StepId, data: OnboardingData): StepId | null {
  const visibleSteps = getVisibleSteps(data)
  const currentIndex = visibleSteps.findIndex((s) => s.id === currentStepId)
  const prevStep = visibleSteps[currentIndex - 1]
  return prevStep ? prevStep.id : null
}

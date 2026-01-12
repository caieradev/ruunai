'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import { getStepNumber, getTotalSteps, getNextStep, getPreviousStep } from '@/lib/onboarding/steps'
import { StepId } from '@/lib/onboarding/types'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import Card from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

import GoalStep from './steps/GoalStep'
import EventDetailsStep from './steps/EventDetailsStep'
import ExperienceStep from './steps/ExperienceStep'
import BeginnerComfortStep from './steps/BeginnerComfortStep'
import AdvancedFitnessStep from './steps/AdvancedFitnessStep'
import WeeklyVolumeStep from './steps/WeeklyVolumeStep'
import DaysPerWeekStep from './steps/DaysPerWeekStep'
import PreferredDaysStep from './steps/PreferredDaysStep'
import LongestRunStep from './steps/LongestRunStep'
import InjuriesStep from './steps/InjuriesStep'
import EquipmentStep from './steps/EquipmentStep'
import PlanPreferencesStep from './steps/PlanPreferencesStep'
import ReviewStep from './steps/ReviewStep'

const stepComponents: Record<StepId, React.ComponentType> = {
  goal: GoalStep,
  'event-details': EventDetailsStep,
  experience: ExperienceStep,
  'beginner-comfort': BeginnerComfortStep,
  'advanced-fitness': AdvancedFitnessStep,
  'weekly-volume': WeeklyVolumeStep,
  'days-per-week': DaysPerWeekStep,
  'preferred-days': PreferredDaysStep,
  'longest-run': LongestRunStep,
  injuries: InjuriesStep,
  equipment: EquipmentStep,
  'plan-preferences': PlanPreferencesStep,
  review: ReviewStep,
}

const stepTitles: Record<StepId, string> = {
  goal: "What's your running goal?",
  'event-details': 'Tell us about your event',
  experience: "What's your experience level?",
  'beginner-comfort': 'Can you run continuously?',
  'advanced-fitness': 'Share your recent performance',
  'weekly-volume': 'Current weekly running volume',
  'days-per-week': 'How many days can you train?',
  'preferred-days': 'Preferred training days',
  'longest-run': 'Longest recent run',
  injuries: 'Any injuries or limitations?',
  equipment: 'What equipment do you have?',
  'plan-preferences': 'Training plan preferences',
  review: 'Review your profile',
}

const stepDescriptions: Record<StepId, string> = {
  goal: 'Help us understand what you\'re training for',
  'event-details': 'Optional: Add your event date and target time',
  experience: 'This helps us tailor your training intensity',
  'beginner-comfort': 'Let\'s assess your current baseline',
  'advanced-fitness': 'Help us set the right training zones',
  'weekly-volume': 'How many kilometers do you run per week?',
  'days-per-week': 'Select your weekly training availability',
  'preferred-days': 'Optional: Choose which days work best for you',
  'longest-run': 'What\'s the farthest you\'ve run recently?',
  injuries: 'Help us keep your training safe',
  equipment: 'Optional: Tell us about your training environment',
  'plan-preferences': 'Customize how your plan is structured',
  review: 'Confirm your information before we generate your plan',
}

export default function OnboardingFlow() {
  const { data, currentStep, setCurrentStep, resetOnboarding } = useOnboarding()
  const router = useRouter()

  const StepComponent = stepComponents[currentStep]
  const stepNumber = getStepNumber(currentStep, data)
  const totalSteps = getTotalSteps(data)

  const isFirstStep = stepNumber === 1
  const isReviewStep = currentStep === 'review'

  const canGoNext = () => {
    // Add validation logic for each step
    switch (currentStep) {
      case 'goal':
        return !!data.goal
      case 'experience':
        return !!data.experienceLevel
      case 'beginner-comfort':
        return data.canRun20MinsContinuously !== undefined
      case 'weekly-volume':
        return !!data.weeklyVolume
      case 'days-per-week':
        return !!data.daysPerWeek
      case 'longest-run':
        return !!data.longestRecentRun || data.noRecentRun === true
      case 'injuries':
        return !!data.injuryTypes && data.injuryTypes.length > 0
      case 'plan-preferences':
        return !!data.planStyle && !!data.planFlexibility && !!data.intensityTolerance
      default:
        return true
    }
  }

  const handleNext = () => {
    const nextStep = getNextStep(currentStep, data)
    if (nextStep) {
      setCurrentStep(nextStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    const prevStep = getPreviousStep(currentStep, data)
    if (prevStep) {
      setCurrentStep(prevStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleComplete = () => {
    console.log('=== ONBOARDING COMPLETE ===')
    console.log('User Profile Data:', JSON.stringify(data, null, 2))
    console.log('===========================')

    // Show success message and redirect
    alert('Your training profile has been created! Check the console for the data.')
    router.push('/app')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        <ProgressBar current={stepNumber} total={totalSteps} />

        <div className="mt-8 animate-fade-in w-full">
          <Card className="w-full min-w-0">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                {stepTitles[currentStep]}
              </h1>
              <p className="text-text-secondary">
                {stepDescriptions[currentStep]}
              </p>
            </div>

            <div className="w-full min-w-0">
              <StepComponent />
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-dark-border">
              {!isFirstStep && (
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
              )}

              {isReviewStep ? (
                <Button
                  variant="primary"
                  onClick={handleComplete}
                  className="flex-1"
                >
                  Generate my plan
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="flex-1"
                >
                  Next
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

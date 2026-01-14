'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import { getStepNumber, getTotalSteps, getNextStep, getPreviousStep } from '@/lib/onboarding/steps'
import { StepId } from '@/lib/onboarding/types'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import Card from '@/components/ui/Card'
import PlanGeneratingLoader from './PlanGeneratingLoader'
import PlanSuccessScreen from './PlanSuccessScreen'

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

const stepKeys: Record<StepId, string> = {
  goal: 'goal',
  'event-details': 'eventDetails',
  experience: 'experience',
  'beginner-comfort': 'beginnerComfort',
  'advanced-fitness': 'advancedFitness',
  'weekly-volume': 'weeklyVolume',
  'days-per-week': 'daysPerWeek',
  'preferred-days': 'preferredDays',
  'longest-run': 'longestRun',
  injuries: 'injuries',
  equipment: 'equipment',
  'plan-preferences': 'planPreferences',
  review: 'review',
}

type FlowState = 'quiz' | 'loading' | 'success'

interface UserStatus {
  id?: string
  email_confirmed?: boolean
}

export default function OnboardingFlow() {
  const { data, currentStep, setCurrentStep, resetOnboarding } = useOnboarding()
  const [flowState, setFlowState] = useState<FlowState>('quiz')
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const t = useTranslations('onboarding')

  // Check auth status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/me')
        const data = await response.json()
        setUserStatus(data.id ? data : null)
      } catch {
        setUserStatus(null)
      }
    }
    checkAuth()
  }, [])

  const isLoggedIn = !!(userStatus?.id && userStatus?.email_confirmed)

  const StepComponent = stepComponents[currentStep]
  const stepNumber = getStepNumber(currentStep, data)
  const totalSteps = getTotalSteps(data)

  const isFirstStep = stepNumber === 1
  const isReviewStep = currentStep === 'review'

  const canGoNext = () => {
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
    setFlowState('loading')
  }

  const handleLoaderComplete = useCallback(() => {
    setFlowState('success')
  }, [])

  const handleSaveAndContinue = useCallback(async () => {
    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: data }),
      })

      if (response.ok) {
        resetOnboarding()
      }
    } catch (error) {
      console.error('Failed to save onboarding data:', error)
    }
  }, [data, resetOnboarding])

  // Render based on flow state
  if (flowState === 'loading') {
    return <PlanGeneratingLoader onComplete={handleLoaderComplete} />
  }

  if (flowState === 'success') {
    return (
      <PlanSuccessScreen
        isLoggedIn={isLoggedIn}
        onSaveAndContinue={isLoggedIn ? handleSaveAndContinue : undefined}
      />
    )
  }

  const stepKey = stepKeys[currentStep]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        <ProgressBar current={stepNumber} total={totalSteps} />

        <div className="mt-8 animate-fade-in w-full">
          <Card className="w-full min-w-0">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                {t(`steps.${stepKey}.title`)}
              </h1>
              <p className="text-text-secondary">
                {t(`steps.${stepKey}.description`)}
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
                  {t('navigation.back')}
                </Button>
              )}

              {isReviewStep ? (
                <Button
                  variant="primary"
                  onClick={handleComplete}
                  className="flex-1"
                >
                  {t('navigation.generatePlan')}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="flex-1"
                >
                  {t('navigation.next')}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { OnboardingData, StepId } from './types'

interface OnboardingContextType {
  data: OnboardingData
  currentStep: StepId
  updateData: (newData: Partial<OnboardingData>) => void
  setCurrentStep: (step: StepId) => void
  resetOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const STORAGE_KEY = 'ruunai_onboarding_data'
const STEP_KEY = 'ruunai_onboarding_step'

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({})
  const [currentStep, setCurrentStep] = useState<StepId>('goal')
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      const savedStep = localStorage.getItem(STEP_KEY)

      if (savedData) {
        setData(JSON.parse(savedData))
      }
      if (savedStep) {
        setCurrentStep(savedStep as StepId)
      }
    } catch (error) {
      console.error('Failed to load onboarding data from localStorage:', error)
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save onboarding data to localStorage:', error)
    }
  }, [data, isHydrated])

  // Save current step to localStorage
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STEP_KEY, currentStep)
    } catch (error) {
      console.error('Failed to save current step to localStorage:', error)
    }
  }, [currentStep, isHydrated])

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }))
  }

  const resetOnboarding = () => {
    setData({})
    setCurrentStep('goal')
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STEP_KEY)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        data,
        currentStep,
        updateData,
        setCurrentStep,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

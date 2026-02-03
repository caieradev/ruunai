'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Header from '@/components/Header'
import Button from '@/components/ui/Button'
import TodayCard from '@/components/plan/TodayCard'
import StatsStrip from '@/components/dashboard/StatsStrip'
import NextWorkoutCard from '@/components/dashboard/NextWorkoutCard'
import UpcomingDays from '@/components/dashboard/UpcomingDays'
import AchievementsCard from '@/components/dashboard/AchievementsCard'
import ExpiredPlanBanner from '@/components/dashboard/ExpiredPlanBanner'
import GenerateModal from '@/components/plan/GenerateModal'
import CompletionModal from '@/components/plan/CompletionModal'
import SkipModal from '@/components/plan/SkipModal'
import SuggestionModal from '@/components/plan/SuggestionModal'
import PlanGeneratingLoader from '@/components/onboarding/PlanGeneratingLoader'
import type {
  TrainingPlanRow,
  TrainingDayRow,
  PlanFeedback,
  WorkoutLogRow,
  CompletionFeedback,
  SkipReason,
  WorkoutAdjustment,
} from '@/lib/supabase/types'
import type { Achievement } from '@/lib/plan/achievements'
import { getAchievements } from '@/lib/plan/achievements'
import type { WeekLoad } from '@/lib/plan/utils'
import {
  isPlanExpired,
  getWeeklyKm,
  getStreak,
  getMonthCompletion,
  getWeekLoad,
  getNext7Days,
  getNextWorkout,
} from '@/lib/plan/utils'
import {
  Plus,
  LogOut,
  Settings,
  AlertCircle,
} from 'lucide-react'

type FlowState = 'idle' | 'loading' | 'error'

interface DashboardContentProps {
  fullName: string | null
  initialPlan: TrainingPlanRow | null
  initialDays: TrainingDayRow[]
  initialLogs: WorkoutLogRow[]
}

export default function DashboardContent({
  fullName,
  initialPlan,
  initialDays,
  initialLogs,
}: DashboardContentProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('dashboard')
  const tPlan = useTranslations('plan')
  const tCommon = useTranslations('common')

  const [plan, setPlan] = useState<TrainingPlanRow | null>(initialPlan)
  const [days, setDays] = useState<TrainingDayRow[]>(initialDays)
  const [logs, setLogs] = useState<WorkoutLogRow[]>(initialLogs)
  const [flowState, setFlowState] = useState<FlowState>('idle')
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'reset' | 'logout' | null>(null)

  // Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [activeDayId, setActiveDayId] = useState<string | null>(null)
  const [pendingSuggestions, setPendingSuggestions] = useState<WorkoutAdjustment[]>([])

  // Generation refs (same pattern as OnboardingFlow)
  const apiDoneRef = useRef(false)
  const apiSuccessRef = useRef(false)
  const loaderDoneRef = useRef(false)
  const generateTypeRef = useRef<'new' | 'regenerate'>('new')
  const feedbackRef = useRef<PlanFeedback | undefined>(undefined)

  const planExpired = plan ? isPlanExpired(plan) : false

  // Derive stats from current state so they recompute after plan generation
  const weeklyKm = useMemo(() => getWeeklyKm(days, logs), [days, logs])
  const streak = useMemo(() => getStreak(days, logs), [days, logs])
  const monthCompletion = useMemo(() => getMonthCompletion(days, logs), [days, logs])
  const weekLoad = useMemo(() => getWeekLoad(days), [days])
  const next7DaysWithDates = useMemo(
    () => plan ? getNext7Days(days, plan.starts_at, plan.ends_at) : [],
    [days, plan]
  )
  const nextWorkout = useMemo(() => getNextWorkout(days, logs), [days, logs])
  const achievements = useMemo(
    () => getAchievements(days, logs, streak, monthCompletion),
    [days, logs, streak, monthCompletion]
  )

  const generatePlan = useCallback(async () => {
    try {
      const body: Record<string, unknown> = {
        type: generateTypeRef.current,
        language: locale,
      }
      if (feedbackRef.current) {
        body.feedback = feedbackRef.current
      }

      const response = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        let message = 'Failed to generate plan'
        try {
          const errorData = await response.json()
          if (errorData.error) message = errorData.error
        } catch {
          // Response body was not valid JSON
        }
        throw new Error(message)
      }

      const data = await response.json()
      setPlan(data.plan)
      setDays(data.days ?? [])
      apiSuccessRef.current = true
    } catch (error) {
      apiSuccessRef.current = false
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate plan')
    } finally {
      apiDoneRef.current = true
      if (loaderDoneRef.current) {
        setFlowState(apiSuccessRef.current ? 'idle' : 'error')
      }
    }
  }, [locale])

  const startGeneration = useCallback((type: 'new' | 'regenerate', feedback?: PlanFeedback) => {
    apiDoneRef.current = false
    apiSuccessRef.current = false
    loaderDoneRef.current = false
    generateTypeRef.current = type
    feedbackRef.current = feedback
    setGenerationError(null)
    setShowGenerateModal(false)
    setFlowState('loading')
    generatePlan()
  }, [generatePlan])

  const handleLoaderComplete = useCallback(() => {
    loaderDoneRef.current = true
    if (apiDoneRef.current) {
      setFlowState(apiSuccessRef.current ? 'idle' : 'error')
    }
  }, [])

  const handleRetry = useCallback(() => {
    setGenerationError(null)
    apiDoneRef.current = false
    apiSuccessRef.current = false
    loaderDoneRef.current = false
    setFlowState('loading')
    generatePlan()
  }, [generatePlan])

  const handleGenerateNew = useCallback((feedback?: PlanFeedback) => {
    startGeneration('new', feedback)
  }, [startGeneration])

  const handleMarkComplete = useCallback((dayId: string) => {
    setActiveDayId(dayId)
    setShowCompletionModal(true)
  }, [])

  const handleSkipWorkout = useCallback((dayId: string) => {
    setActiveDayId(dayId)
    setShowSkipModal(true)
  }, [])

  const handleCompletionConfirm = useCallback(async (feedback: CompletionFeedback) => {
    if (!activeDayId) return
    setShowCompletionModal(false)
    try {
      const response = await fetch('/api/plan/workout/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ training_day_id: activeDayId, feedback }),
      })
      if (response.ok) {
        const data = await response.json()
        setLogs(prev => {
          const filtered = prev.filter(l => l.training_day_id !== activeDayId)
          return [...filtered, data.log]
        })
      }
    } catch (error) {
      console.error('Failed to complete workout:', error)
    }
    setActiveDayId(null)
  }, [activeDayId])

  const handleSkipConfirm = useCallback(async (reason: SkipReason) => {
    if (!activeDayId) return
    setShowSkipModal(false)
    try {
      const response = await fetch('/api/plan/workout/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ training_day_id: activeDayId, reason }),
      })
      if (response.ok) {
        const data = await response.json()
        setLogs(prev => {
          const filtered = prev.filter(l => l.training_day_id !== activeDayId)
          return [...filtered, data.log]
        })
        if (data.suggestions && data.suggestions.length > 0) {
          setPendingSuggestions(data.suggestions)
          setShowSuggestionModal(true)
        }
      }
    } catch (error) {
      console.error('Failed to skip workout:', error)
    }
    setActiveDayId(null)
  }, [activeDayId])

  const handleAcceptSuggestions = useCallback(async () => {
    setShowSuggestionModal(false)
    try {
      const response = await fetch('/api/plan/workout/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustments: pendingSuggestions }),
      })
      if (response.ok) {
        const data = await response.json()
        // Update the local days state with adjusted values
        setDays(prev => prev.map(day => {
          const updated = (data.updated_days as TrainingDayRow[]).find(u => u.id === day.id)
          return updated ?? day
        }))
      }
    } catch (error) {
      console.error('Failed to apply adjustments:', error)
    }
    setPendingSuggestions([])
  }, [pendingSuggestions])

  const handleRejectSuggestions = useCallback(() => {
    setShowSuggestionModal(false)
    setPendingSuggestions([])
  }, [])

  const handleResetOnboarding = async () => {
    if (!confirm(t('resetConfirm'))) return
    setLoading('reset')
    try {
      const response = await fetch('/api/onboarding/clear_responses', { method: 'POST' })
      if (response.ok) {
        localStorage.removeItem('ruunai_onboarding_data')
        localStorage.removeItem('ruunai_onboarding_step')
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Failed to reset onboarding:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleLogout = async () => {
    setLoading('logout')
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        localStorage.removeItem('ruunai_onboarding_data')
        localStorage.removeItem('ruunai_onboarding_step')
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to logout:', error)
    } finally {
      setLoading(null)
    }
  }

  const displayName = fullName || tCommon('runner')

  // Loading state — full screen loader
  if (flowState === 'loading') {
    return (
      <>
        <Header showLogin={false} />
        <PlanGeneratingLoader onComplete={handleLoaderComplete} />
      </>
    )
  }

  // Error state
  if (flowState === 'error') {
    return (
      <>
        <Header showLogin={false} />
        <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto w-full">
            <div className="rounded-xl border border-dark-border bg-dark-surface p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-3">
                {tCommon('error')}
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                {generationError || tPlan('noPlan.message')}
              </p>
              <Button variant="primary" onClick={handleRetry}>
                {tCommon('tryAgain')}
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome header */}
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
              {t('welcomeBack')} <span className="gradient-text">{displayName}</span>
            </h1>
            {plan && !planExpired && (
              <p className="text-sm text-text-secondary">{plan.title}</p>
            )}
          </div>

          {/* Expired plan banner */}
          {plan && planExpired && (
            <ExpiredPlanBanner
              endDate={plan.ends_at}
              onGenerateNew={() => setShowGenerateModal(true)}
            />
          )}

          {/* Stats strip — show when plan exists */}
          {plan && (
            <StatsStrip
              weeklyKm={weeklyKm}
              streak={streak}
              monthCompletion={monthCompletion}
              weekLoad={weekLoad}
            />
          )}

          {/* No plan state */}
          {!plan && (
            <div className="rounded-xl border-2 border-dashed border-dark-border bg-dark-surface p-12 text-center animate-fade-in">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-accent-primary/20 flex items-center justify-center">
                  <Plus className="w-7 h-7 text-accent-primary" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                {tPlan('noPlan.title')}
              </h2>
              <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
                {tPlan('noPlan.message')}
              </p>
              <Button
                variant="primary"
                onClick={() => startGeneration('new')}
              >
                {tPlan('noPlan.generate')}
              </Button>
            </div>
          )}

          {/* Workout cards: Today + Next */}
          {plan && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3">
                <TodayCard
                  plan={plan}
                  days={days}
                  logs={logs}
                  onGenerateNew={() => setShowGenerateModal(true)}
                  onComplete={handleMarkComplete}
                  onSkip={handleSkipWorkout}
                />
              </div>
              <div className="lg:col-span-2">
                <NextWorkoutCard workout={nextWorkout} />
              </div>
            </div>
          )}

          {/* Upcoming days */}
          {plan && next7DaysWithDates.length > 0 && (
            <UpcomingDays days={next7DaysWithDates} logs={logs} />
          )}

          {/* Achievements */}
          {plan && (
            <AchievementsCard achievements={achievements} />
          )}

          {/* Quick actions */}
          <div className="rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-6 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-dark-border shrink-0">
                <Settings className="w-5 h-5 text-accent-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary mb-3">{t('quickActions')}</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetOnboarding}
                    disabled={loading === 'reset'}
                  >
                    {loading === 'reset' ? t('resetting') : t('resetOnboarding')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    disabled={loading === 'logout'}
                    className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    {loading === 'logout' ? t('loggingOut') : t('logOut')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <GenerateModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onConfirm={handleGenerateNew}
        showFeedback={!!plan && !planExpired}
      />
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => { setShowCompletionModal(false); setActiveDayId(null) }}
        onConfirm={handleCompletionConfirm}
      />
      <SkipModal
        isOpen={showSkipModal}
        onClose={() => { setShowSkipModal(false); setActiveDayId(null) }}
        onConfirm={handleSkipConfirm}
      />
      <SuggestionModal
        isOpen={showSuggestionModal}
        onClose={() => { setShowSuggestionModal(false); setPendingSuggestions([]) }}
        onAccept={handleAcceptSuggestions}
        onReject={handleRejectSuggestions}
        suggestions={pendingSuggestions}
        days={days}
      />
    </>
  )
}

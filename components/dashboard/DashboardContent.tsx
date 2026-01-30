'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Header from '@/components/Header'
import Button from '@/components/ui/Button'
import TodayCard from '@/components/plan/TodayCard'
import WeeklyView from '@/components/plan/WeeklyView'
import MonthlyCalendar from '@/components/plan/MonthlyCalendar'
import PlanHistory from '@/components/plan/PlanHistory'
import GenerateModal from '@/components/plan/GenerateModal'
import RegenerateModal from '@/components/plan/RegenerateModal'
import PlanGeneratingLoader from '@/components/onboarding/PlanGeneratingLoader'
import type { TrainingPlanRow, TrainingDayRow, PlanFeedback } from '@/lib/supabase/types'
import { isPlanExpired } from '@/lib/plan/utils'
import {
  Plus,
  RefreshCw,
  LogOut,
  Settings,
  AlertCircle,
} from 'lucide-react'

type Tab = 'today' | 'week' | 'month' | 'history'
type FlowState = 'idle' | 'loading' | 'error'

interface DashboardContentProps {
  fullName: string | null
  initialPlan: TrainingPlanRow | null
  initialDays: TrainingDayRow[]
}

export default function DashboardContent({
  fullName,
  initialPlan,
  initialDays,
}: DashboardContentProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('dashboard')
  const tPlan = useTranslations('plan')
  const tCommon = useTranslations('common')

  const [plan, setPlan] = useState<TrainingPlanRow | null>(initialPlan)
  const [days, setDays] = useState<TrainingDayRow[]>(initialDays)
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [flowState, setFlowState] = useState<FlowState>('idle')
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'reset' | 'logout' | null>(null)

  // Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)

  // Generation refs (same pattern as OnboardingFlow)
  const apiDoneRef = useRef(false)
  const apiSuccessRef = useRef(false)
  const loaderDoneRef = useRef(false)
  const generateTypeRef = useRef<'new' | 'regenerate'>('new')
  const feedbackRef = useRef<PlanFeedback | undefined>(undefined)

  const planExpired = plan ? isPlanExpired(plan) : false
  const remainingRegenerations = Math.max(0, 10 - (plan?.generation_count ?? 0))

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
        if (apiSuccessRef.current) {
          setActiveTab('today')
        }
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
    setShowRegenerateModal(false)
    setFlowState('loading')
    generatePlan()
  }, [generatePlan])

  const handleLoaderComplete = useCallback(() => {
    loaderDoneRef.current = true
    if (apiDoneRef.current) {
      setFlowState(apiSuccessRef.current ? 'idle' : 'error')
      if (apiSuccessRef.current) {
        setActiveTab('today')
      }
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

  const handleRegenerate = useCallback((feedback?: PlanFeedback) => {
    startGeneration('regenerate', feedback)
  }, [startGeneration])

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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'today', label: tPlan('tabs.today') },
    { key: 'week', label: tPlan('tabs.week') },
    { key: 'month', label: tPlan('tabs.month') },
    { key: 'history', label: tPlan('tabs.history') },
  ]

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome header */}
          <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
              {t('welcomeBack')} <span className="gradient-text">{displayName}</span>
            </h1>
            {plan && !planExpired && (
              <p className="text-sm text-text-secondary">{plan.title}</p>
            )}
          </div>

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

          {/* Plan views */}
          {plan && (
            <div className="space-y-6 animate-fade-in">
              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-lg bg-dark-surface border border-dark-border">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${activeTab === tab.key
                        ? 'bg-accent-primary text-dark-bg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-dark-border/50'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-6">
                {activeTab === 'today' && (
                  <TodayCard
                    plan={plan}
                    days={days}
                    onGenerateNew={() => setShowGenerateModal(true)}
                  />
                )}
                {activeTab === 'week' && (
                  <WeeklyView plan={plan} days={days} />
                )}
                {activeTab === 'month' && (
                  <MonthlyCalendar plan={plan} days={days} />
                )}
                {activeTab === 'history' && (
                  <PlanHistory />
                )}
              </div>

              {/* Action buttons */}
              {activeTab !== 'history' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {planExpired && (
                    <Button
                      variant="primary"
                      onClick={() => setShowGenerateModal(true)}
                      className="flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {tPlan('actions.generateNew')}
                    </Button>
                  )}
                  {!planExpired && (
                    <Button
                      variant="secondary"
                      onClick={() => setShowRegenerateModal(true)}
                      disabled={remainingRegenerations <= 0}
                      className="flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {tPlan('actions.regenerate')}
                      <span className="text-xs opacity-70">
                        ({tPlan('actions.remaining', { count: remainingRegenerations })})
                      </span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div className="mt-8 rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-6 animate-slide-up">
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
      <RegenerateModal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        onConfirm={handleRegenerate}
        remainingCount={remainingRegenerations}
      />
    </>
  )
}

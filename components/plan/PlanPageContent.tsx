'use client'

import { useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Header from '@/components/Header'
import Button from '@/components/ui/Button'
import WeeklyView from '@/components/plan/WeeklyView'
import MonthlyCalendar from '@/components/plan/MonthlyCalendar'
import PlanHistory from '@/components/plan/PlanHistory'
import RegenerateModal from '@/components/plan/RegenerateModal'
import PlanGeneratingLoader from '@/components/onboarding/PlanGeneratingLoader'
import type { TrainingPlanRow, TrainingDayRow, WorkoutLogRow, PlanFeedback } from '@/lib/supabase/types'
import { isPlanExpired } from '@/lib/plan/utils'
import { ChevronLeft, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type Tab = 'week' | 'month' | 'history'
type FlowState = 'idle' | 'loading' | 'error'

interface PlanPageContentProps {
  initialPlan: TrainingPlanRow | null
  initialDays: TrainingDayRow[]
  initialLogs: WorkoutLogRow[]
}

export default function PlanPageContent({
  initialPlan,
  initialDays,
  initialLogs,
}: PlanPageContentProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('plan')
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams()
  const initialDate = searchParams.get('date') ?? undefined
  const [activeTab, setActiveTab] = useState<Tab>('week')
  const [descExpanded, setDescExpanded] = useState(false)

  const [plan, setPlan] = useState<TrainingPlanRow | null>(initialPlan)
  const [days, setDays] = useState<TrainingDayRow[]>(initialDays)
  const logs = initialLogs

  // Regeneration flow state
  const [flowState, setFlowState] = useState<FlowState>('idle')
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)

  const apiDoneRef = useRef(false)
  const apiSuccessRef = useRef(false)
  const loaderDoneRef = useRef(false)
  const feedbackRef = useRef<PlanFeedback | undefined>(undefined)

  const planExpired = plan ? isPlanExpired(plan) : false
  const remainingRegenerations = Math.max(0, 10 - (plan?.generation_count ?? 0))
  const descOverflows = (plan?.description?.length ?? 0) > 120

  const tabs: { key: Tab; label: string }[] = [
    { key: 'week', label: t('tabs.week') },
    { key: 'month', label: t('tabs.month') },
    { key: 'history', label: t('tabs.history') },
  ]

  const regeneratePlan = useCallback(async () => {
    try {
      const body: Record<string, unknown> = {
        type: 'regenerate',
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

  const handleRegenerate = useCallback((feedback?: PlanFeedback) => {
    apiDoneRef.current = false
    apiSuccessRef.current = false
    loaderDoneRef.current = false
    feedbackRef.current = feedback
    setGenerationError(null)
    setShowRegenerateModal(false)
    setFlowState('loading')
    regeneratePlan()
  }, [regeneratePlan])

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
    regeneratePlan()
  }, [regeneratePlan])

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
                {generationError || t('noPlan.message')}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="primary" onClick={handleRetry}>
                  {tCommon('tryAgain')}
                </Button>
                <Button variant="secondary" onClick={() => setFlowState('idle')}>
                  {t('regenerateModal.cancel')}
                </Button>
              </div>
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
        <div className="max-w-4xl mx-auto">
          {/* Back to dashboard */}
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>

          {plan && (
            <div className="mb-6 rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-5">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{plan.title}</h1>
              {plan.description && (
                <div className="mt-2">
                  <div
                    className="relative"
                    style={
                      !descExpanded && descOverflows
                        ? { maxHeight: '2.85rem', overflow: 'hidden' }
                        : undefined
                    }
                  >
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                  {!descExpanded && descOverflows && (
                    <div
                      className="pointer-events-none"
                      style={{ height: '1.25rem', marginTop: '-1.25rem', background: 'linear-gradient(to top, var(--color-dark-surface), transparent)' }}
                    />
                  )}
                  {descOverflows && (
                    <button
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="flex items-center gap-0.5 text-xs text-accent-primary hover:text-accent-hover transition-colors mt-1.5"
                    >
                      {descExpanded ? t('showLess') : t('showMore')}
                      {descExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-dark-surface border border-dark-border mb-6">
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
            {!plan && (
              <p className="text-text-muted text-center py-8">{t('noPlan.message')}</p>
            )}
            {plan && activeTab === 'week' && (
              <WeeklyView plan={plan} days={days} logs={logs} initialDate={initialDate} />
            )}
            {plan && activeTab === 'month' && (
              <MonthlyCalendar plan={plan} days={days} logs={logs} />
            )}
            {activeTab === 'history' && (
              <PlanHistory />
            )}
          </div>

          {/* Regenerate section */}
          {plan && !planExpired && (
            <div className="mt-6 rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-text-secondary">
                    {t('actions.regenerateHint')}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {t('actions.remaining', { count: remainingRegenerations })}
                  </p>
                </div>
                <button
                  onClick={() => setShowRegenerateModal(true)}
                  disabled={remainingRegenerations <= 0}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text-primary bg-dark-border/50 hover:bg-dark-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('actions.regenerate')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <RegenerateModal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        onConfirm={handleRegenerate}
        remainingCount={remainingRegenerations}
      />
    </>
  )
}

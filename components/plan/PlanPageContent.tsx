'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import WeeklyView from '@/components/plan/WeeklyView'
import MonthlyCalendar from '@/components/plan/MonthlyCalendar'
import PlanHistory from '@/components/plan/PlanHistory'
import type { TrainingPlanRow, TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type Tab = 'week' | 'month' | 'history'

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
  const t = useTranslations('plan')
  const searchParams = useSearchParams()
  const initialDate = searchParams.get('date') ?? undefined
  const [activeTab, setActiveTab] = useState<Tab>('week')

  const plan = initialPlan
  const days = initialDays
  const logs = initialLogs

  const tabs: { key: Tab; label: string }[] = [
    { key: 'week', label: t('tabs.week') },
    { key: 'month', label: t('tabs.month') },
    { key: 'history', label: t('tabs.history') },
  ]

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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary">{plan.title}</h1>
              {plan.description && (
                <p className="text-sm text-text-secondary mt-1">{plan.description}</p>
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
        </div>
      </main>
    </>
  )
}

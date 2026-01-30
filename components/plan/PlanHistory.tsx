'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { TrainingPlanRow } from '@/lib/supabase/types'
import HistoricalPlanView from './HistoricalPlanView'
import { History, ChevronRight } from 'lucide-react'

export default function PlanHistory() {
  const [plans, setPlans] = useState<TrainingPlanRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const t = useTranslations('plan.history')

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('/api/plan/history')
        const data = await response.json()
        setPlans(data.plans ?? [])
      } catch {
        console.error('Failed to fetch plan history')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (selectedPlanId) {
    const plan = plans.find(p => p.id === selectedPlanId)
    if (plan) {
      return (
        <HistoricalPlanView
          plan={plan}
          onBack={() => setSelectedPlanId(null)}
        />
      )
    }
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-sm text-text-secondary">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {plans.map(plan => (
        <button
          key={plan.id}
          onClick={() => setSelectedPlanId(plan.id)}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-dark-border bg-dark-surface hover:bg-dark-border/50 transition-colors text-left"
        >
          <div>
            <h4 className="text-sm font-semibold text-text-primary">
              {plan.title ?? t('defaultTitle')}
            </h4>
            <p className="text-xs text-text-muted mt-0.5">
              {new Date(plan.starts_at).toLocaleDateString()} — {new Date(plan.ends_at).toLocaleDateString()}
            </p>
            {plan.weekly_summary && (
              <p className="text-xs text-text-secondary mt-1">{plan.weekly_summary}</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
        </button>
      ))}
    </div>
  )
}

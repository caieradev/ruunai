'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { TrainingPlanRow, TrainingDayRow } from '@/lib/supabase/types'
import MonthlyCalendar from './MonthlyCalendar'
import { ArrowLeft } from 'lucide-react'

interface HistoricalPlanViewProps {
  plan: TrainingPlanRow
  onBack: () => void
}

export default function HistoricalPlanView({ plan, onBack }: HistoricalPlanViewProps) {
  const [days, setDays] = useState<TrainingDayRow[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations('plan')

  useEffect(() => {
    async function fetchDays() {
      try {
        const response = await fetch(`/api/plan/history/${plan.id}`)
        const data = await response.json()
        setDays(data.days ?? [])
      } catch {
        console.error('Failed to fetch plan days')
      } finally {
        setLoading(false)
      }
    }
    fetchDays()
  }, [plan.id])

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('history.title')}
      </button>

      <div>
        <h3 className="text-lg font-bold text-text-primary">
          {plan.title ?? t('history.defaultTitle')}
        </h3>
        {plan.description && (
          <p className="text-sm text-text-secondary mt-1">{plan.description}</p>
        )}
        <p className="text-xs text-text-muted mt-1">
          {new Date(plan.starts_at).toLocaleDateString()} — {new Date(plan.ends_at).toLocaleDateString()}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <MonthlyCalendar plan={plan} days={days} />
      )}
    </div>
  )
}

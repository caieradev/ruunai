'use client'

import { useTranslations } from 'next-intl'
import type { TrainingPlanRow, TrainingDayRow } from '@/lib/supabase/types'
import { getTodayWorkout, isPlanExpired } from '@/lib/plan/utils'
import WorkoutDetail from './WorkoutDetail'
import RestDayCard from './RestDayCard'
import PlanExpiredCard from './PlanExpiredCard'
import { Calendar } from 'lucide-react'

interface TodayCardProps {
  plan: TrainingPlanRow
  days: TrainingDayRow[]
  onGenerateNew: () => void
}

export default function TodayCard({ plan, days, onGenerateNew }: TodayCardProps) {
  const t = useTranslations('plan')

  if (isPlanExpired(plan)) {
    return <PlanExpiredCard onGenerateNew={onGenerateNew} />
  }

  const todayWorkout = getTodayWorkout(days)

  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-6">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-4 h-4 text-accent-primary" />
        <span className="text-xs text-accent-primary font-medium uppercase tracking-wider">
          {t('today.label')}
        </span>
      </div>

      {todayWorkout ? (
        <div className="mt-4">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            {todayWorkout.title}
          </h2>
          <WorkoutDetail day={todayWorkout} />
        </div>
      ) : (
        <RestDayCard />
      )}
    </div>
  )
}

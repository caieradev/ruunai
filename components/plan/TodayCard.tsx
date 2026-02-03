'use client'

import { useTranslations } from 'next-intl'
import type { TrainingPlanRow, TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'
import { getTodayWorkout, isPlanExpired } from '@/lib/plan/utils'
import WorkoutDetail from './WorkoutDetail'
import RestDayCard from './RestDayCard'
import PlanExpiredCard from './PlanExpiredCard'
import Button from '@/components/ui/Button'
import { Calendar } from 'lucide-react'

interface TodayCardProps {
  plan: TrainingPlanRow
  days: TrainingDayRow[]
  logs: WorkoutLogRow[]
  onGenerateNew: () => void
  onComplete: (dayId: string) => void
  onSkip: (dayId: string) => void
}

export default function TodayCard({ plan, days, logs, onGenerateNew, onComplete, onSkip }: TodayCardProps) {
  const t = useTranslations('plan')

  if (isPlanExpired(plan)) {
    return <PlanExpiredCard onGenerateNew={onGenerateNew} />
  }

  const todayWorkout = getTodayWorkout(days)
  const todayLog = todayWorkout
    ? logs.find(l => l.training_day_id === todayWorkout.id) ?? null
    : null

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
          <WorkoutDetail day={todayWorkout} log={todayLog} />

          {/* Action buttons — only if not logged yet */}
          {!todayLog && (
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onComplete(todayWorkout.id)}
                className="flex-1"
              >
                {t('trackActions.markDone')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSkip(todayWorkout.id)}
                className="flex-1"
              >
                {t('trackActions.didntDoIt')}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <RestDayCard />
      )}
    </div>
  )
}

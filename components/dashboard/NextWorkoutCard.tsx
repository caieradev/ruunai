'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import type { TrainingDayRow } from '@/lib/supabase/types'
import { getWorkoutColor, getWorkoutBgLight, formatDate } from '@/lib/plan/utils'
import { Ruler, Clock, Gauge } from 'lucide-react'

interface NextWorkoutCardProps {
  workout: TrainingDayRow | null
}

export default function NextWorkoutCard({ workout }: NextWorkoutCardProps) {
  const t = useTranslations('dashboard.nextWorkout')
  const tPlan = useTranslations('plan')
  const locale = useLocale()

  if (!workout) {
    return (
      <div className="rounded-xl border border-dark-border bg-dark-surface p-6 flex items-center justify-center h-full">
        <p className="text-sm text-text-muted">{t('noUpcoming')}</p>
      </div>
    )
  }

  const workoutDate = new Date(workout.date + 'T00:00:00')

  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-text-muted uppercase tracking-wider">
            {t('title')}
          </span>
          <span className="text-xs text-text-muted">
            {formatDate(workoutDate, locale)}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {workout.title}
        </h3>

        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${getWorkoutBgLight(workout.workout_type)} ${getWorkoutColor(workout.workout_type)}`}>
          {tPlan(`workoutTypes.${workout.workout_type}`)}
        </span>

        <div className="flex items-center gap-3 mt-2">
          {workout.distance_km && (
            <span className="flex items-center gap-1 text-sm text-text-secondary">
              <Ruler className="w-3.5 h-3.5" />
              {workout.distance_km} km
            </span>
          )}
          {workout.duration_minutes && (
            <span className="flex items-center gap-1 text-sm text-text-secondary">
              <Clock className="w-3.5 h-3.5" />
              {workout.duration_minutes} min
            </span>
          )}
          {workout.target_pace && (
            <span className="flex items-center gap-1 text-sm text-text-secondary">
              <Gauge className="w-3.5 h-3.5" />
              {workout.target_pace}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

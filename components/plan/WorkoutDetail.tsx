'use client'

import { useTranslations } from 'next-intl'
import type { TrainingDayRow } from '@/lib/supabase/types'
import { getWorkoutColor, getWorkoutBgLight } from '@/lib/plan/utils'
import { Clock, Ruler, Gauge, Flame, Snowflake } from 'lucide-react'

interface WorkoutDetailProps {
  day: TrainingDayRow
  compact?: boolean
}

export default function WorkoutDetail({ day, compact = false }: WorkoutDetailProps) {
  const t = useTranslations('plan')
  const workoutColor = getWorkoutColor(day.workout_type)
  const bgLight = getWorkoutBgLight(day.workout_type)

  return (
    <div className="space-y-4">
      <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium ${bgLight} ${workoutColor}`}>
        {t(`workoutTypes.${day.workout_type}`)}
      </span>
      <div className="flex items-center gap-3">
        {day.distance_km && (
          <span className="flex items-center gap-1 text-sm text-text-secondary">
            <Ruler className="w-3.5 h-3.5" />
            {day.distance_km} km
          </span>
        )}
        {day.duration_minutes && (
          <span className="flex items-center gap-1 text-sm text-text-secondary">
            <Clock className="w-3.5 h-3.5" />
            {day.duration_minutes} min
          </span>
        )}
        {day.target_pace && (
          <span className="flex items-center gap-1 text-sm text-text-secondary">
            <Gauge className="w-3.5 h-3.5" />
            {day.target_pace}
          </span>
        )}
      </div>

      {!compact && (
        <>
          <p className="text-text-secondary text-sm leading-relaxed">
            {day.description}
          </p>

          {day.warmup && (
            <div className="flex items-start gap-2 text-sm">
              <Flame className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-text-primary font-medium">{t('warmup')}:</span>
                <span className="text-text-secondary ml-1">{day.warmup}</span>
              </div>
            </div>
          )}

          {day.cooldown && (
            <div className="flex items-start gap-2 text-sm">
              <Snowflake className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-text-primary font-medium">{t('cooldown')}:</span>
                <span className="text-text-secondary ml-1">{day.cooldown}</span>
              </div>
            </div>
          )}

          {day.notes && (
            <div className="mt-3 p-3 rounded-lg bg-dark-surface border border-dark-border">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{t('notes')}</p>
              <p className="text-sm text-text-secondary">{day.notes}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

'use client'

import { useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Button from '@/components/ui/Button'
import type { WorkoutAdjustment, TrainingDayRow } from '@/lib/supabase/types'

interface SuggestionModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  onReject: () => void
  suggestions: WorkoutAdjustment[]
  days: TrainingDayRow[]
}

export default function SuggestionModal({
  isOpen,
  onClose,
  onAccept,
  onReject,
  suggestions,
  days,
}: SuggestionModalProps) {
  const t = useTranslations('plan.suggestion')
  const tWorkout = useTranslations('plan.workoutTypes')

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen || suggestions.length === 0) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="suggestion-modal-title"
    >
      <div className="mx-4 w-full max-w-lg rounded-xl border border-dark-border bg-dark-surface p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 id="suggestion-modal-title" className="text-xl font-bold text-text-primary">
          {t('title')}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {t('message')}
        </p>

        <div className="mt-6 space-y-4">
          {suggestions.map(suggestion => {
            const originalDay = days.find(d => d.id === suggestion.training_day_id)
            if (!originalDay) return null

            return (
              <div
                key={suggestion.training_day_id}
                className="rounded-lg border border-dark-border bg-dark-bg p-4"
              >
                <p className="text-sm font-medium text-text-primary mb-3">
                  {originalDay.title}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Original */}
                  <div>
                    <span className="text-xs text-text-muted uppercase tracking-wider">{t('original')}</span>
                    <div className="mt-1 space-y-1 text-text-secondary">
                      <p>{tWorkout(originalDay.workout_type)}</p>
                      {originalDay.distance_km != null && <p>{originalDay.distance_km} km</p>}
                      {originalDay.duration_minutes != null && <p>{originalDay.duration_minutes} min</p>}
                      {originalDay.target_pace != null && <p>{originalDay.target_pace}</p>}
                    </div>
                  </div>
                  {/* Suggested */}
                  <div>
                    <span className="text-xs text-accent-primary uppercase tracking-wider">{t('suggested')}</span>
                    <div className="mt-1 space-y-1 text-text-primary">
                      <p>{tWorkout(suggestion.workout_type ?? originalDay.workout_type)}</p>
                      {(suggestion.distance_km !== undefined ? suggestion.distance_km : originalDay.distance_km) != null && (
                        <p>
                          {suggestion.distance_km !== undefined ? suggestion.distance_km : originalDay.distance_km} km
                        </p>
                      )}
                      {(suggestion.duration_minutes !== undefined ? suggestion.duration_minutes : originalDay.duration_minutes) != null && (
                        <p>
                          {suggestion.duration_minutes !== undefined ? suggestion.duration_minutes : originalDay.duration_minutes} min
                        </p>
                      )}
                      {(suggestion.target_pace !== undefined ? suggestion.target_pace : originalDay.target_pace) != null && (
                        <p>{suggestion.target_pace !== undefined ? suggestion.target_pace : originalDay.target_pace}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onReject} className="flex-1">
            {t('reject')}
          </Button>
          <Button onClick={onAccept} className="flex-1">
            {t('accept')}
          </Button>
        </div>
      </div>
    </div>
  )
}

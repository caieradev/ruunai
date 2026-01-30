'use client'

import { useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Button from '@/components/ui/Button'
import FeedbackForm from '@/components/plan/FeedbackForm'
import type { PlanFeedback } from '@/lib/supabase/types'

interface RegenerateModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (feedback?: PlanFeedback) => void
  remainingCount: number
}

export default function RegenerateModal({ isOpen, onClose, onConfirm, remainingCount }: RegenerateModalProps) {
  const t = useTranslations('plan.regenerateModal')

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="regenerate-modal-title"
    >
      <div className="mx-4 w-full max-w-lg rounded-xl border border-dark-border bg-dark-surface p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 id="regenerate-modal-title" className="text-xl font-bold text-text-primary">
          {t('title')}
        </h2>

        <p className="mt-2 text-text-secondary">
          {t('message')}
        </p>

        <p className="mt-3 text-sm font-medium text-accent-primary">
          {t('remaining', { count: remainingCount })}
        </p>

        <div className="mt-6 rounded-lg border border-dark-border bg-dark-bg p-4 sm:p-6">
          <FeedbackForm onSubmit={(feedback) => onConfirm(feedback)} />
        </div>

        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            {t('cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import type { CompletionFeedback } from '@/lib/supabase/types'

interface CompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (feedback: CompletionFeedback) => void
}

const FEEDBACK_OPTIONS: { value: CompletionFeedback; color: string }[] = [
  { value: 'FELT_EASY', color: 'bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30' },
  { value: 'FELT_ADEQUATE', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/30' },
  { value: 'FELT_HARD', color: 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' },
]

export default function CompletionModal({ isOpen, onClose, onConfirm }: CompletionModalProps) {
  const t = useTranslations('plan.completion')

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
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-modal-title"
    >
      <div className="mx-4 w-full max-w-sm rounded-xl border border-dark-border bg-dark-surface p-6 shadow-2xl">
        <h2 id="completion-modal-title" className="text-lg font-bold text-text-primary text-center mb-6">
          {t('title')}
        </h2>

        <div className="flex gap-3">
          {FEEDBACK_OPTIONS.map(({ value, color }) => (
            <button
              key={value}
              onClick={() => onConfirm(value)}
              className={`flex-1 py-3 px-2 rounded-lg border text-sm font-medium transition-all ${color}`}
            >
              {t(value)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Button from '@/components/ui/Button'
import type { SkipReason } from '@/lib/supabase/types'

interface SkipModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: SkipReason) => void
}

const SKIP_REASONS: SkipReason[] = [
  'TOO_TIRED',
  'INJURY',
  'NO_TIME',
  'TOO_HARD',
  'WEATHER',
  'SICK',
  'OTHER',
]

export default function SkipModal({ isOpen, onClose, onConfirm }: SkipModalProps) {
  const [selected, setSelected] = useState<SkipReason | null>(null)
  const t = useTranslations('plan.skip')

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    setSelected(null)
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
      aria-labelledby="skip-modal-title"
    >
      <div className="mx-4 w-full max-w-sm rounded-xl border border-dark-border bg-dark-surface p-6 shadow-2xl">
        <h2 id="skip-modal-title" className="text-lg font-bold text-text-primary text-center mb-4">
          {t('title')}
        </h2>

        <div className="space-y-2 mb-6">
          {SKIP_REASONS.map(reason => (
            <button
              key={reason}
              onClick={() => setSelected(reason)}
              className={`
                w-full px-4 py-3 rounded-lg border text-sm text-left transition-all
                ${selected === reason
                  ? 'border-accent-primary bg-accent-primary/10 text-text-primary'
                  : 'border-dark-border bg-dark-bg text-text-secondary hover:border-dark-muted'
                }
              `}
            >
              {t(reason)}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1" size="sm">
            {t('cancel')}
          </Button>
          <Button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className="flex-1"
            size="sm"
          >
            {t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}

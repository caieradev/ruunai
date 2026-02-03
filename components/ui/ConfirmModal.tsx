'use client'

import { useEffect, useCallback } from 'react'
import Button from '@/components/ui/Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  variant?: 'default' | 'danger'
  loading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) onClose()
  }, [onClose, loading])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose()
  }

  const isDanger = variant === 'danger'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="mx-4 w-full max-w-sm rounded-xl border border-dark-border bg-dark-surface p-6 shadow-2xl">
        <h2
          id="confirm-modal-title"
          className={`text-lg font-bold text-center mb-2 ${isDanger ? 'text-red-400' : 'text-text-primary'}`}
        >
          {title}
        </h2>
        <p className="text-sm text-text-secondary text-center mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            size="sm"
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${isDanger ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : ''}`}
            size="sm"
            disabled={loading}
          >
            {loading ? '...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

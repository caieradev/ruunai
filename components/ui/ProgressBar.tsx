'use client'

import { useTranslations } from 'next-intl'

interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100
  const t = useTranslations('common')

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 text-sm text-text-secondary">
        <span>{t('stepOf', { current, total })}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-dark-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

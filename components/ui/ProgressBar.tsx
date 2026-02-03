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
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-2 bg-dark-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: 'repeating-linear-gradient(90deg, #00E5A0, #00c98a 25%, #00E5A0 50%)',
            backgroundSize: '200% 100%',
            animation: 'progress-flow 1.5s linear infinite',
          }}
        />
      </div>
      <span className="text-sm text-text-secondary tabular-nums">{Math.round(percentage)}%</span>
    </div>
  )
}

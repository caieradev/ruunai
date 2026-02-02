'use client'

import { useTranslations } from 'next-intl'
import type { WeekLoad } from '@/lib/plan/utils'
import { TrendingUp, TrendingDown, Minus, Flame, Target, Activity } from 'lucide-react'

interface StatsStripProps {
  weeklyKm: { current: number; previous: number }
  streak: number
  monthCompletion: number
  weekLoad: WeekLoad
}

export default function StatsStrip({ weeklyKm, streak, monthCompletion, weekLoad }: StatsStripProps) {
  const t = useTranslations('dashboard.stats')

  const diff = Math.round((weeklyKm.current - weeklyKm.previous) * 10) / 10
  const diffSign = diff > 0 ? '+' : ''

  const loadColors: Record<WeekLoad, string> = {
    light: 'text-green-400',
    moderate: 'text-yellow-400',
    heavy: 'text-red-400',
  }

  const loadBgColors: Record<WeekLoad, string> = {
    light: 'bg-green-400/20',
    moderate: 'bg-yellow-400/20',
    heavy: 'bg-red-400/20',
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Weekly km */}
      <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-accent-primary" />
          <span className="text-xs text-text-muted">{t('weeklyKm')}</span>
        </div>
        <p className="text-2xl font-bold text-text-primary">
          {weeklyKm.current}<span className="text-sm font-normal text-text-muted ml-1">{t('weeklyKmUnit')}</span>
        </p>
        {weeklyKm.previous > 0 && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-text-muted'}`}>
            {diff > 0 ? <TrendingUp className="w-3 h-3" /> : diff < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {diffSign}{diff} {t('weeklyKmUnit')}
          </div>
        )}
      </div>

      {/* Streak */}
      <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-text-muted">{t('streak')}</span>
        </div>
        <p className="text-2xl font-bold text-text-primary">
          {streak}
        </p>
        <p className="text-xs text-text-muted mt-1">
          {t('streakUnit', { count: streak })}
        </p>
      </div>

      {/* Month completion */}
      <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-text-muted">{t('monthCompletion')}</span>
        </div>
        <p className="text-2xl font-bold text-text-primary">
          {monthCompletion}<span className="text-sm font-normal text-text-muted ml-0.5">%</span>
        </p>
        <div className="w-full h-1.5 bg-dark-border rounded-full mt-2">
          <div
            className="h-full bg-blue-400 rounded-full transition-all"
            style={{ width: `${Math.min(100, monthCompletion)}%` }}
          />
        </div>
      </div>

      {/* Week load */}
      <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-text-muted" />
          <span className="text-xs text-text-muted">{t('weekLoad')}</span>
        </div>
        <div className={`inline-flex items-center px-2 py-0.5 rounded-sm text-sm font-medium ${loadBgColors[weekLoad]} ${loadColors[weekLoad]}`}>
          {t(`weekLoad${weekLoad.charAt(0).toUpperCase() + weekLoad.slice(1)}`)}
        </div>
      </div>
    </div>
  )
}

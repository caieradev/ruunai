'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'
import { getWorkoutBgColor, getDayName, isToday } from '@/lib/plan/utils'
import { Moon, Check, X, ChevronRight } from 'lucide-react'

interface UpcomingDaysProps {
  days: { date: Date; day: TrainingDayRow | null; inPlan: boolean }[]
  logs: WorkoutLogRow[]
}

export default function UpcomingDays({ days, logs }: UpcomingDaysProps) {
  const t = useTranslations('dashboard.upcoming')
  const locale = useLocale()
  const router = useRouter()

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    router.push(`/app/plan?date=${dateStr}`)
  }

  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{t('title')}</h3>
        <button
          onClick={() => router.push('/app/plan')}
          className="flex items-center gap-1 text-xs text-accent-primary hover:text-accent-hover transition-colors"
        >
          {t('viewPlan')}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(({ date, day, inPlan }) => {
          const dateStr = date.toISOString().split('T')[0]
          const today = isToday(date)
          const dayLog = day ? logs.find(l => l.training_day_id === day.id) : null

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(date)}
              className={`
                relative flex flex-col items-center p-2 rounded-lg transition-all text-center cursor-pointer
                ${!inPlan ? 'opacity-30' : 'hover:bg-dark-border/50'}
                ${today ? 'ring-2 ring-accent-primary bg-dark-border/30' : ''}
              `}
            >
              <span className="text-[10px] text-text-muted uppercase">
                {getDayName(date, locale)}
              </span>
              <span className={`text-sm font-medium mt-0.5 ${today ? 'text-accent-primary' : 'text-text-primary'}`}>
                {date.getDate()}
              </span>
              {day ? (
                <div className={`w-2 h-2 rounded-full mt-1.5 ${getWorkoutBgColor(day.workout_type)}`} />
              ) : (
                <Moon className="w-2 h-2 mt-1.5 text-dark-muted" />
              )}
              {dayLog && (
                <div className="absolute top-0.5 right-0.5">
                  {dayLog.status === 'completed' ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <X className="w-3 h-3 text-red-400" />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

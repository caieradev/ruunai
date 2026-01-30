'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import type { TrainingPlanRow, TrainingDayRow } from '@/lib/supabase/types'
import type { WorkoutType } from '@/lib/supabase/types'
import { getWorkoutBgColor, getWorkoutBgLight, getWorkoutColor, isToday } from '@/lib/plan/utils'
import WorkoutDetail from './WorkoutDetail'
import { Moon } from 'lucide-react'

interface MonthlyCalendarProps {
  plan: TrainingPlanRow
  days: TrainingDayRow[]
}

function getCalendarBg(type: WorkoutType): string {
  const colors: Record<WorkoutType, string> = {
    easy_run: 'bg-green-400/25',
    tempo: 'bg-yellow-400/25',
    intervals: 'bg-red-400/25',
    long_run: 'bg-blue-400/25',
    recovery: 'bg-emerald-300/25',
    cross_training: 'bg-purple-400/25',
    race_pace: 'bg-orange-400/25',
  }
  return colors[type] ?? 'bg-dark-border'
}

export default function MonthlyCalendar({ plan, days }: MonthlyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const t = useTranslations('plan')
  const locale = useLocale()

  const calendarDays: { date: Date, day: TrainingDayRow | null }[] = []
  const start = new Date(plan.starts_at + 'T00:00:00')
  for (let i = 0; i < 30; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const day = days.find(d => d.date === dateStr) ?? null
    calendarDays.push({ date, day })
  }

  // Monday-first: getDay() returns 0=Sun, we want 0=Mon
  const firstDow = start.getDay()
  const paddingBefore = firstDow === 0 ? 6 : firstDow - 1

  const selectedDay = selectedDate
    ? calendarDays.find(cd => cd.date.toISOString().split('T')[0] === selectedDate)
    : null

  // Monday-first weekday headers
  const weekdayHeaders = Array.from({ length: 7 }, (_, i) => {
    // Jan 6, 2025 = Monday
    const refDate = new Date(2025, 0, 6 + i)
    return refDate.toLocaleDateString(locale, { weekday: 'short' })
  })

  return (
    <div className="space-y-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2">
        {weekdayHeaders.map((header, i) => (
          <div key={i} className="text-center text-xs font-medium text-text-muted">
            {header}
          </div>
        ))}
      </div>

      {/* Calendar grid — weeks as rows */}
      <div className="space-y-2">
        {(() => {
          const allCells: (typeof calendarDays[number] | null)[] = [
            ...Array.from({ length: paddingBefore }, () => null),
            ...calendarDays,
          ]
          // Pad to complete the last row
          while (allCells.length % 7 !== 0) {
            allCells.push(null)
          }

          const weeks: (typeof allCells)[] = []
          for (let i = 0; i < allCells.length; i += 7) {
            weeks.push(allCells.slice(i, i + 7))
          }

          return weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-2">
              {week.map((cell, cellIdx) => {
                if (!cell) {
                  return <div key={`empty-${weekIdx}-${cellIdx}`} className="aspect-square" />
                }

                const { date, day } = cell
                const dateStr = date.toISOString().split('T')[0]
                const today = isToday(date)
                const isSelected = selectedDate === dateStr

                if (day) {
                  // Training day — colored block
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`
                        aspect-square rounded-lg ${getCalendarBg(day.workout_type)}
                        flex flex-col items-center justify-center gap-0.5
                        transition-all hover:scale-105 hover:shadow-lg cursor-pointer
                        ${today ? 'ring-2 ring-accent-primary' : ''}
                        ${isSelected ? 'ring-2 ring-text-primary scale-105 shadow-lg' : ''}
                      `}
                      title={day.title}
                    >
                      <span className={` font-bold ${today ? 'text-accent-primary' : getWorkoutColor(day.workout_type)}`}>
                        {date.getDate()}
                      </span>
                      <span className={`text-sm font-medium leading-tight ${getWorkoutColor(day.workout_type)} opacity-80 hidden sm:block`}>
                        {t(`workoutTypes.${day.workout_type}`)}
                      </span>
                    </button>
                  )
                }

                // Rest day — subtle block
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`
                      aspect-square rounded-lg bg-dark-border/40
                      flex flex-col items-center justify-center gap-0.5
                      transition-all hover:bg-dark-border/70 cursor-pointer
                      ${today ? 'ring-2 ring-accent-primary' : ''}
                      ${isSelected ? 'ring-2 ring-text-primary bg-dark-border/70' : ''}
                    `}
                  >
                    <span className={`text-xs font-medium ${today ? 'text-accent-primary' : 'text-text-muted'}`}>
                      {date.getDate()}
                    </span>
                    <Moon className="w-2.5 h-2.5 text-text-muted/50 hidden sm:block" />
                  </button>
                )
              })}
            </div>
          ))
        })()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
        {(['easy_run', 'tempo', 'intervals', 'long_run', 'recovery', 'cross_training', 'race_pace'] as const).map(type => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${getCalendarBg(type)}`} />
            <span className="text-[11px] text-text-muted">{t(`workoutTypes.${type}`)}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-dark-border/40" />
          <span className="text-[11px] text-text-muted">{t('restDay.title')}</span>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="rounded-xl border border-dark-border bg-dark-bg p-4 animate-fade-in">
          {selectedDay.day ? (
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-3">
                {selectedDay.day.title}
              </h4>
              <WorkoutDetail day={selectedDay.day} />
            </div>
          ) : (
            <div className="text-center py-4">
              <Moon className="w-6 h-6 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">{t('restDay.title')}</p>
              <p className="text-xs text-text-secondary mt-1">{t('restDay.message')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import type { TrainingPlanRow, TrainingDayRow } from '@/lib/supabase/types'
import { getWeekDays, getWorkoutBgColor, getDayName, isToday } from '@/lib/plan/utils'
import WorkoutDetail from './WorkoutDetail'
import RestDayCard from './RestDayCard'
import { ChevronLeft, ChevronRight, Moon } from 'lucide-react'

interface WeeklyViewProps {
  plan: TrainingPlanRow
  days: TrainingDayRow[]
}

export default function WeeklyView({ plan, days }: WeeklyViewProps) {
  const [weekOffset, setWeekOffset] = useState(() => {
    const today = new Date()
    const start = new Date(plan.starts_at + 'T00:00:00')
    const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, Math.min(Math.floor(diffDays / 7), 3))
  })

  const t = useTranslations('plan')
  const locale = useLocale()

  const weekDays = getWeekDays(days, plan.starts_at, weekOffset)

  // Auto-select today if it's in this week, otherwise the first training day
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const todayEntry = weekDays.find(wd => isToday(wd.date) && wd.inPlan)
    if (todayEntry) return todayEntry.date.toISOString().split('T')[0]
    const firstTraining = weekDays.find(wd => wd.day && wd.inPlan)
    if (firstTraining) return firstTraining.date.toISOString().split('T')[0]
    const firstInPlan = weekDays.find(wd => wd.inPlan)
    if (firstInPlan) return firstInPlan.date.toISOString().split('T')[0]
    return weekDays[0].date.toISOString().split('T')[0]
  })

  const selectedDay = weekDays.find(wd => wd.date.toISOString().split('T')[0] === selectedDate) ?? null

  const maxWeek = Math.ceil(30 / 7) - 1

  const handleWeekChange = (newOffset: number) => {
    setWeekOffset(newOffset)
    // Re-select best day in new week
    const newWeekDays = getWeekDays(days, plan.starts_at, newOffset)
    const todayEntry = newWeekDays.find(wd => isToday(wd.date) && wd.inPlan)
    if (todayEntry) {
      setSelectedDate(todayEntry.date.toISOString().split('T')[0])
      return
    }
    const firstTraining = newWeekDays.find(wd => wd.day && wd.inPlan)
    if (firstTraining) {
      setSelectedDate(firstTraining.date.toISOString().split('T')[0])
      return
    }
    const firstInPlan = newWeekDays.find(wd => wd.inPlan)
    if (firstInPlan) {
      setSelectedDate(firstInPlan.date.toISOString().split('T')[0])
      return
    }
    setSelectedDate(newWeekDays[0].date.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">
          {t('week.label', { number: weekOffset + 1 })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => handleWeekChange(Math.max(0, weekOffset - 1))}
            disabled={weekOffset === 0}
            className="p-1.5 rounded-lg hover:bg-dark-border disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={() => handleWeekChange(Math.min(maxWeek, weekOffset + 1))}
            disabled={weekOffset >= maxWeek}
            className="p-1.5 rounded-lg hover:bg-dark-border disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(({ date, day, inPlan }) => {
          const dateStr = date.toISOString().split('T')[0]
          const today = isToday(date)
          const isSelected = selectedDate === dateStr

          return (
            <button
              key={dateStr}
              onClick={() => inPlan && setSelectedDate(dateStr)}
              disabled={!inPlan}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-all text-center
                ${!inPlan ? 'opacity-30 cursor-default' : 'cursor-pointer'}
                ${today ? 'ring-2 ring-accent-primary' : ''}
                ${isSelected ? 'bg-dark-border' : inPlan ? 'hover:bg-dark-border/50' : ''}
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
            </button>
          )
        })}
      </div>

      {/* Always-visible detail panel */}
      <div className="rounded-xl border border-dark-border bg-dark-bg p-4 animate-fade-in">
        {selectedDay?.day ? (
          <div>
            <h4 className="text-lg font-semibold text-text-primary mb-3">
              {selectedDay.day.title}
            </h4>
            <WorkoutDetail day={selectedDay.day} />
          </div>
        ) : (
          <RestDayCard />
        )}
      </div>
    </div>
  )
}

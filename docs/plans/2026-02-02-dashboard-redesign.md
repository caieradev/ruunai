# Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the dashboard from a tab-based plan viewer into a content-rich hub with stats, next-7-days preview, achievements, and a dedicated `/app/plan` page for detailed plan views.

**Architecture:** The current `DashboardContent` is refactored into a vertical-scroll hub. Tabs (Week/Month/History) move to a new `/app/plan` page. New utility functions compute stats (streak, weekly km, month completion %, week load) from existing data. Achievements are computed on-the-fly from workout logs. Expired plans remain visible with a warning banner instead of being hidden.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, next-intl, Lucide React, Supabase

---

### Task 1: Add new translation keys (en, pt-BR, es)

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pt-BR.json`
- Modify: `messages/es.json`

**Step 1: Add keys to en.json**

Add to the `"dashboard"` section:

```json
"stats": {
  "weeklyKm": "This Week",
  "weeklyKmUnit": "km",
  "weeklyKmCompare": "{diff} vs last week",
  "streak": "Streak",
  "streakUnit": "{count, plural, one {day} other {days}}",
  "monthCompletion": "Month",
  "monthCompletionUnit": "completed",
  "weekLoad": "Week Load",
  "weekLoadLight": "Light",
  "weekLoadModerate": "Moderate",
  "weekLoadHeavy": "Heavy",
  "viewAll": "View all stats"
},
"nextWorkout": {
  "title": "Next Up",
  "noUpcoming": "No upcoming workouts",
  "on": "on"
},
"upcoming": {
  "title": "Upcoming Days",
  "viewPlan": "View full plan"
},
"achievements": {
  "title": "Achievements",
  "viewAll": "View all",
  "first5k": "First 5K",
  "first10k": "First 10K",
  "first21k": "First Half Marathon",
  "streak3": "3-Day Streak",
  "streak5": "5-Day Streak",
  "streak10": "10-Day Streak",
  "streak30": "30-Day Streak",
  "month50": "Half Month Done",
  "month100": "Month Complete",
  "firstWeek": "First Full Week",
  "firstMonth": "First Full Month"
},
"expiredBanner": {
  "message": "Your plan ended on {date}.",
  "generate": "Generate New Plan"
},
"comingSoonPage": "Coming soon"
```

**Step 2: Add equivalent keys to pt-BR.json**

Translate all keys above to Brazilian Portuguese.

**Step 3: Add equivalent keys to es.json**

Translate all keys above to Spanish.

**Step 4: Commit**

```bash
git add messages/en.json messages/pt-BR.json messages/es.json
git commit -m "feat: add dashboard redesign translation keys (en, pt-BR, es)"
```

---

### Task 2: Add stat computation utilities

**Files:**
- Modify: `lib/plan/utils.ts`

**Step 1: Add `getWeeklyKm` function**

Computes total km completed in the last 7 days.

```typescript
export function getWeeklyKm(
  days: TrainingDayRow[],
  logs: WorkoutLogRow[]
): { current: number; previous: number } {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  const twoWeeksAgo = new Date(today)
  twoWeeksAgo.setDate(today.getDate() - 14)
  const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0]

  const completedDayIds = new Set(
    logs.filter(l => l.status === 'completed').map(l => l.training_day_id)
  )

  let current = 0
  let previous = 0
  for (const day of days) {
    if (!completedDayIds.has(day.id)) continue
    if (day.date > weekAgoStr && day.date <= todayStr) {
      current += day.distance_km ?? 0
    } else if (day.date > twoWeeksAgoStr && day.date <= weekAgoStr) {
      previous += day.distance_km ?? 0
    }
  }

  return {
    current: Math.round(current * 10) / 10,
    previous: Math.round(previous * 10) / 10,
  }
}
```

**Step 2: Add `getStreak` function**

Counts consecutive completed workouts backwards from today (skipping rest days).

```typescript
export function getStreak(
  days: TrainingDayRow[],
  logs: WorkoutLogRow[]
): number {
  const today = new Date().toISOString().split('T')[0]

  // Sort training days by date descending, only past or today
  const pastDays = days
    .filter(d => d.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))

  const logMap = new Map(logs.map(l => [l.training_day_id, l]))

  let streak = 0
  for (const day of pastDays) {
    const log = logMap.get(day.id)
    if (log?.status === 'completed') {
      streak++
    } else if (log?.status === 'skipped') {
      break
    } else {
      // No log yet — if the day is today, skip it (user hasn't done it yet)
      // If it's a past day with no log, treat as missed → break
      if (day.date === today) continue
      break
    }
  }
  return streak
}
```

**Step 3: Add `getMonthCompletion` function**

Returns percentage of training days completed in the active plan.

```typescript
export function getMonthCompletion(
  days: TrainingDayRow[],
  logs: WorkoutLogRow[]
): number {
  if (days.length === 0) return 0
  const completedCount = logs.filter(l => l.status === 'completed').length
  return Math.round((completedCount / days.length) * 100)
}
```

**Step 4: Add `getWeekLoad` function**

Returns 'light' | 'moderate' | 'heavy' based on workout types this week.

```typescript
export type WeekLoad = 'light' | 'moderate' | 'heavy'

export function getWeekLoad(days: TrainingDayRow[]): WeekLoad {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  const weekDays = days.filter(d => d.date > weekAgoStr && d.date <= todayStr)
  if (weekDays.length === 0) return 'light'

  const intense = new Set<WorkoutType>(['intervals', 'tempo', 'race_pace'])
  const intenseCount = weekDays.filter(d => intense.has(d.workout_type)).length
  const ratio = intenseCount / weekDays.length

  if (ratio >= 0.5) return 'heavy'
  if (ratio >= 0.2) return 'moderate'
  return 'light'
}
```

**Step 5: Add `getNext7Days` function**

Returns next 7 calendar days starting from today with matched training days.

```typescript
export function getNext7Days(
  days: TrainingDayRow[],
  planStartDate: string,
  planEndDate: string
): { date: Date; day: TrainingDayRow | null; inPlan: boolean }[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const result: { date: Date; day: TrainingDayRow | null; inPlan: boolean }[] = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const day = days.find(d => d.date === dateStr) ?? null
    const inPlan = dateStr >= planStartDate && dateStr <= planEndDate
    result.push({ date, day, inPlan })
  }
  return result
}
```

**Step 6: Add `getNextWorkout` function**

Returns the next training day after today that hasn't been completed/skipped.

```typescript
export function getNextWorkout(
  days: TrainingDayRow[],
  logs: WorkoutLogRow[]
): TrainingDayRow | null {
  const today = new Date().toISOString().split('T')[0]
  const loggedIds = new Set(logs.map(l => l.training_day_id))

  return days
    .filter(d => d.date > today && !loggedIds.has(d.id))
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
}
```

**Step 7: Commit**

```bash
git add lib/plan/utils.ts
git commit -m "feat: add stat computation utilities (weekly km, streak, month %, load, next workout)"
```

---

### Task 3: Add achievement computation utility

**Files:**
- Create: `lib/plan/achievements.ts`

**Step 1: Create achievements module**

```typescript
import type { TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'

export interface Achievement {
  id: string
  icon: string  // Lucide icon name
  unlocked: boolean
}

const VOLUME_THRESHOLDS = [
  { id: 'first5k', threshold: 5 },
  { id: 'first10k', threshold: 10 },
  { id: 'first21k', threshold: 21 },
] as const

const STREAK_THRESHOLDS = [
  { id: 'streak3', threshold: 3 },
  { id: 'streak5', threshold: 5 },
  { id: 'streak10', threshold: 10 },
  { id: 'streak30', threshold: 30 },
] as const

export function getAchievements(
  days: TrainingDayRow[],
  logs: WorkoutLogRow[],
  streak: number,
  monthCompletion: number
): Achievement[] {
  const completedDayIds = new Set(
    logs.filter(l => l.status === 'completed').map(l => l.training_day_id)
  )

  // Volume achievements — check if any single completed workout hit the distance
  const completedDays = days.filter(d => completedDayIds.has(d.id))
  const maxDistance = Math.max(0, ...completedDays.map(d => d.distance_km ?? 0))

  const achievements: Achievement[] = []

  // Volume-based
  for (const { id, threshold } of VOLUME_THRESHOLDS) {
    achievements.push({ id, icon: 'route', unlocked: maxDistance >= threshold })
  }

  // Streak-based
  // We need max historical streak, not just current. For on-the-fly, use current streak
  // and also check if any past streak was higher by scanning logs chronologically.
  const maxStreak = getMaxStreak(days, logs)
  for (const { id, threshold } of STREAK_THRESHOLDS) {
    achievements.push({ id, icon: 'flame', unlocked: maxStreak >= threshold })
  }

  // Completion-based
  achievements.push({
    id: 'month50',
    icon: 'target',
    unlocked: monthCompletion >= 50,
  })
  achievements.push({
    id: 'month100',
    icon: 'trophy',
    unlocked: monthCompletion >= 100,
  })

  // Consistency-based
  const hasFullWeek = checkFullWeek(days, logs)
  achievements.push({ id: 'firstWeek', icon: 'calendar-check', unlocked: hasFullWeek })
  achievements.push({ id: 'firstMonth', icon: 'award', unlocked: monthCompletion >= 100 })

  return achievements
}

function getMaxStreak(days: TrainingDayRow[], logs: WorkoutLogRow[]): number {
  const today = new Date().toISOString().split('T')[0]
  const pastDays = days.filter(d => d.date <= today).sort((a, b) => a.date.localeCompare(b.date))
  const logMap = new Map(logs.map(l => [l.training_day_id, l]))

  let maxStreak = 0
  let current = 0

  for (const day of pastDays) {
    const log = logMap.get(day.id)
    if (log?.status === 'completed') {
      current++
      maxStreak = Math.max(maxStreak, current)
    } else if (log?.status === 'skipped') {
      current = 0
    }
    // No log and not today → missed, but don't break — they might have logged later days
  }

  return maxStreak
}

function checkFullWeek(days: TrainingDayRow[], logs: WorkoutLogRow[]): boolean {
  // Check if there's any 7-consecutive-calendar-day span where all training days were completed
  const completedDates = new Set<string>()
  const logMap = new Map(logs.map(l => [l.training_day_id, l]))

  for (const day of days) {
    if (logMap.get(day.id)?.status === 'completed') {
      completedDates.add(day.date)
    }
  }

  const trainingDates = new Set(days.map(d => d.date))

  // Slide a 7-day window across the plan
  if (days.length === 0) return false
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  const startDate = new Date(sorted[0].date + 'T00:00:00')

  for (let offset = 0; offset <= 23; offset++) {
    const windowStart = new Date(startDate)
    windowStart.setDate(startDate.getDate() + offset)
    let allCompleted = true
    let hasTraining = false

    for (let d = 0; d < 7; d++) {
      const checkDate = new Date(windowStart)
      checkDate.setDate(windowStart.getDate() + d)
      const dateStr = checkDate.toISOString().split('T')[0]

      if (trainingDates.has(dateStr)) {
        hasTraining = true
        if (!completedDates.has(dateStr)) {
          allCompleted = false
          break
        }
      }
    }

    if (hasTraining && allCompleted) return true
  }

  return false
}
```

**Step 2: Commit**

```bash
git add lib/plan/achievements.ts
git commit -m "feat: add achievement computation from workout logs"
```

---

### Task 4: Create StatsStrip component

**Files:**
- Create: `components/dashboard/StatsStrip.tsx`

**Step 1: Create the component**

```typescript
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
```

**Step 2: Commit**

```bash
git add components/dashboard/StatsStrip.tsx
git commit -m "feat: add StatsStrip component with weekly km, streak, month %, week load"
```

---

### Task 5: Create NextWorkoutCard component

**Files:**
- Create: `components/dashboard/NextWorkoutCard.tsx`

**Step 1: Create the component**

```typescript
'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import type { TrainingDayRow } from '@/lib/supabase/types'
import { getWorkoutColor, getWorkoutBgLight, formatDate } from '@/lib/plan/utils'
import { ChevronRight, Ruler, Clock, Gauge } from 'lucide-react'

interface NextWorkoutCardProps {
  workout: TrainingDayRow | null
}

export default function NextWorkoutCard({ workout }: NextWorkoutCardProps) {
  const t = useTranslations('dashboard.nextWorkout')
  const tPlan = useTranslations('plan')
  const locale = useLocale()

  if (!workout) {
    return (
      <div className="rounded-xl border border-dark-border bg-dark-surface p-6 flex items-center justify-center">
        <p className="text-sm text-text-muted">{t('noUpcoming')}</p>
      </div>
    )
  }

  const workoutDate = new Date(workout.date + 'T00:00:00')

  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-text-muted uppercase tracking-wider">
            {t('title')}
          </span>
          <span className="text-xs text-text-muted">
            {formatDate(workoutDate, locale)}
          </span>
        </div>

        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${getWorkoutBgLight(workout.workout_type)} ${getWorkoutColor(workout.workout_type)}`}>
          {tPlan(`workoutTypes.${workout.workout_type}`)}
        </span>

        <h3 className="text-lg font-semibold text-text-primary mt-2">
          {workout.title}
        </h3>

        <div className="flex items-center gap-3 mt-2">
          {workout.distance_km && (
            <span className="flex items-center gap-1 text-sm text-text-secondary">
              <Ruler className="w-3.5 h-3.5" />
              {workout.distance_km} km
            </span>
          )}
          {workout.duration_minutes && (
            <span className="flex items-center gap-1 text-sm text-text-secondary">
              <Clock className="w-3.5 h-3.5" />
              {workout.duration_minutes} min
            </span>
          )}
          {workout.target_pace && (
            <span className="flex items-center gap-1 text-sm text-text-secondary">
              <Gauge className="w-3.5 h-3.5" />
              {workout.target_pace}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/NextWorkoutCard.tsx
git commit -m "feat: add NextWorkoutCard component"
```

---

### Task 6: Create UpcomingDays component

**Files:**
- Create: `components/dashboard/UpcomingDays.tsx`

**Step 1: Create the component**

Shows next 7 calendar days. Each day is clickable and navigates to `/app/plan?date=YYYY-MM-DD`.

```typescript
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
```

**Step 2: Commit**

```bash
git add components/dashboard/UpcomingDays.tsx
git commit -m "feat: add UpcomingDays component with next-7-days and plan link"
```

---

### Task 7: Create AchievementsCard component

**Files:**
- Create: `components/dashboard/AchievementsCard.tsx`

**Step 1: Create the component**

Shows latest 2-3 unlocked achievements.

```typescript
'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Achievement } from '@/lib/plan/achievements'
import { Flame, Route, Target, Trophy, CalendarCheck, Award, ChevronRight, Lock } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  route: Route,
  target: Target,
  trophy: Trophy,
  'calendar-check': CalendarCheck,
  award: Award,
}

interface AchievementsCardProps {
  achievements: Achievement[]
}

export default function AchievementsCard({ achievements }: AchievementsCardProps) {
  const t = useTranslations('dashboard.achievements')
  const router = useRouter()

  const unlocked = achievements.filter(a => a.unlocked)
  const display = unlocked.length > 0
    ? unlocked.slice(-3)
    : achievements.slice(0, 3)

  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{t('title')}</h3>
        <button
          onClick={() => router.push('/app/achievements')}
          className="flex items-center gap-1 text-xs text-accent-primary hover:text-accent-hover transition-colors"
        >
          {t('viewAll')}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-3">
        {display.map(achievement => {
          const Icon = iconMap[achievement.icon] ?? Trophy
          return (
            <div
              key={achievement.id}
              className={`
                flex-1 flex flex-col items-center p-3 rounded-lg border transition-all
                ${achievement.unlocked
                  ? 'border-accent-primary/30 bg-accent-primary/5'
                  : 'border-dark-border bg-dark-bg opacity-50'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${achievement.unlocked ? 'bg-accent-primary/20' : 'bg-dark-border'}
              `}>
                {achievement.unlocked ? (
                  <Icon className="w-5 h-5 text-accent-primary" />
                ) : (
                  <Lock className="w-4 h-4 text-text-muted" />
                )}
              </div>
              <span className={`text-xs font-medium text-center ${achievement.unlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                {t(achievement.id)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/AchievementsCard.tsx
git commit -m "feat: add AchievementsCard component"
```

---

### Task 8: Create ExpiredPlanBanner component

**Files:**
- Create: `components/dashboard/ExpiredPlanBanner.tsx`

**Step 1: Create the component**

```typescript
'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { AlertCircle, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/plan/utils'

interface ExpiredPlanBannerProps {
  endDate: string
  onGenerateNew: () => void
}

export default function ExpiredPlanBanner({ endDate, onGenerateNew }: ExpiredPlanBannerProps) {
  const t = useTranslations('dashboard.expiredBanner')
  const locale = useLocale()

  const date = new Date(endDate + 'T00:00:00')

  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
        <p className="text-sm text-yellow-200">
          {t('message', { date: formatDate(date, locale) })}
        </p>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={onGenerateNew}
        className="flex items-center gap-2 shrink-0"
      >
        <Plus className="w-4 h-4" />
        {t('generate')}
      </Button>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/ExpiredPlanBanner.tsx
git commit -m "feat: add ExpiredPlanBanner component"
```

---

### Task 9: Fix status badge rounded style

**Files:**
- Modify: `components/plan/TodayCard.tsx`
- Modify: `components/plan/WorkoutDetail.tsx`

**Step 1: Fix TodayCard status badge**

In `components/plan/TodayCard.tsx`, change `rounded-full` to `rounded-sm` on the status badge (line 46):

```
// Before
'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3'
// After
'inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium mb-3'
```

**Step 2: Fix WorkoutDetail status badge**

In `components/plan/WorkoutDetail.tsx`, change `rounded-full` to `rounded-sm` on the status badge (line 23):

```
// Before
`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${...}`
// After
`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium ${...}`
```

**Step 3: Commit**

```bash
git add components/plan/TodayCard.tsx components/plan/WorkoutDetail.tsx
git commit -m "fix: standardize status badges to rounded-sm"
```

---

### Task 10: Refactor DashboardContent into hub layout

**Files:**
- Modify: `components/dashboard/DashboardContent.tsx`
- Modify: `app/app/page.tsx`

This is the main task. The dashboard changes from tab-based to a vertical hub.

**Step 1: Update `app/app/page.tsx` to compute stats server-side**

Add stat computation imports and pass computed values to `DashboardContent`:

```typescript
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import DashboardContent from '@/components/dashboard/DashboardContent'
import type { TrainingPlanRow, TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'
import {
  getWeeklyKm,
  getStreak,
  getMonthCompletion,
  getWeekLoad,
  getNext7Days,
  getNextWorkout,
} from '@/lib/plan/utils'
import { getAchievements } from '@/lib/plan/achievements'

// ... existing auth/data fetching stays the same ...

// After fetching days and logs, compute stats:
const weeklyKm = getWeeklyKm(days, logs)
const streak = getStreak(days, logs)
const monthCompletion = getMonthCompletion(days, logs)
const weekLoad = getWeekLoad(days)
const next7Days = typedPlan
  ? getNext7Days(days, typedPlan.starts_at, typedPlan.ends_at)
  : []
const nextWorkout = getNextWorkout(days, logs)
const achievements = getAchievements(days, logs, streak, monthCompletion)

// Pass all to DashboardContent
return (
  <DashboardContent
    fullName={typedRunner?.full_name ?? null}
    initialPlan={typedPlan}
    initialDays={days}
    initialLogs={logs}
    weeklyKm={weeklyKm}
    streak={streak}
    monthCompletion={monthCompletion}
    weekLoad={weekLoad}
    next7Days={next7Days}
    nextWorkout={nextWorkout}
    achievements={achievements}
  />
)
```

**Step 2: Rewrite DashboardContent**

Replace the tab-based layout with the hub layout. Keep all modal logic and generation flow (startGeneration, handleLoaderComplete, etc.) — only the JSX/layout changes.

Key changes:
- Remove tabs state and tab rendering
- Add `ExpiredPlanBanner` when plan is expired (instead of hiding content)
- Add `StatsStrip` after welcome header
- Layout `TodayCard` and `NextWorkoutCard` side by side (grid)
- Add `UpcomingDays` section
- Add `AchievementsCard`
- Keep Quick Actions at bottom
- Keep all modals as-is

The props interface expands to include the new computed values:

```typescript
interface DashboardContentProps {
  fullName: string | null
  initialPlan: TrainingPlanRow | null
  initialDays: TrainingDayRow[]
  initialLogs: WorkoutLogRow[]
  weeklyKm: { current: number; previous: number }
  streak: number
  monthCompletion: number
  weekLoad: WeekLoad
  next7Days: { date: Date; day: TrainingDayRow | null; inPlan: boolean }[]
  nextWorkout: TrainingDayRow | null
  achievements: Achievement[]
}
```

The main JSX becomes:

```tsx
{/* Expired plan banner */}
{plan && planExpired && (
  <ExpiredPlanBanner
    endDate={plan.ends_at}
    onGenerateNew={() => setShowGenerateModal(true)}
  />
)}

{/* Stats strip — show when plan exists */}
{plan && (
  <StatsStrip
    weeklyKm={weeklyKm}
    streak={streak}
    monthCompletion={monthCompletion}
    weekLoad={weekLoad}
  />
)}

{/* No plan state — keep as-is */}
{!plan && ( /* existing no-plan card */ )}

{/* Workout cards: Today + Next */}
{plan && (
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
    <div className="lg:col-span-3">
      <TodayCard ... />
    </div>
    <div className="lg:col-span-2">
      <NextWorkoutCard workout={nextWorkout} />
    </div>
  </div>
)}

{/* Upcoming days */}
{plan && next7Days.length > 0 && (
  <UpcomingDays days={next7Days} logs={logs} />
)}

{/* Achievements */}
{plan && (
  <AchievementsCard achievements={achievements} />
)}

{/* Regenerate button — only when plan is active */}
{plan && !planExpired && (
  <div className="flex">
    <Button variant="secondary" onClick={() => setShowRegenerateModal(true)} ...>
      <RefreshCw /> Regenerate ({remaining})
    </Button>
  </div>
)}

{/* Quick actions — keep as-is */}
```

**Step 3: Commit**

```bash
git add app/app/page.tsx components/dashboard/DashboardContent.tsx
git commit -m "feat: refactor dashboard into hub layout with stats, upcoming days, achievements"
```

---

### Task 11: Create `/app/plan` page

**Files:**
- Create: `app/app/plan/page.tsx`

**Step 1: Create the server component page**

This page receives the tabs that were removed from the dashboard (Week, Month, History). It reuses the existing `WeeklyView`, `MonthlyCalendar`, and `PlanHistory` components.

```typescript
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import PlanPageContent from '@/components/plan/PlanPageContent'
import type { TrainingPlanRow, TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'

export default async function PlanPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/app/plan')

  const { data: runner } = await supabase
    .from('runners')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!(runner as { onboarding_completed: boolean } | null)?.onboarding_completed) {
    redirect('/onboarding')
  }

  const { data: plan } = await supabase
    .from('training_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const typedPlan = plan as TrainingPlanRow | null

  let days: TrainingDayRow[] = []
  let logs: WorkoutLogRow[] = []
  if (typedPlan) {
    const { data: trainingDays } = await supabase
      .from('training_days')
      .select('*')
      .eq('plan_id', typedPlan.id)
      .order('day_number')

    days = (trainingDays as TrainingDayRow[] | null) ?? []

    const dayIds = days.map(d => d.id)
    if (dayIds.length > 0) {
      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('*')
        .in('training_day_id', dayIds)

      logs = (workoutLogs as WorkoutLogRow[] | null) ?? []
    }
  }

  return (
    <PlanPageContent
      initialPlan={typedPlan}
      initialDays={days}
      initialLogs={logs}
    />
  )
}
```

**Step 2: Commit**

```bash
git add app/app/plan/page.tsx
git commit -m "feat: add /app/plan server page with data fetching"
```

---

### Task 12: Create PlanPageContent component

**Files:**
- Create: `components/plan/PlanPageContent.tsx`

**Step 1: Create the client component**

This is the tab-based plan viewer that was previously in the dashboard. Tabs: Week | Month | History. Supports `?date=` query param for deep linking from the dashboard.

```typescript
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import WeeklyView from '@/components/plan/WeeklyView'
import MonthlyCalendar from '@/components/plan/MonthlyCalendar'
import PlanHistory from '@/components/plan/PlanHistory'
import type { TrainingPlanRow, TrainingDayRow, WorkoutLogRow } from '@/lib/supabase/types'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type Tab = 'week' | 'month' | 'history'

interface PlanPageContentProps {
  initialPlan: TrainingPlanRow | null
  initialDays: TrainingDayRow[]
  initialLogs: WorkoutLogRow[]
}

export default function PlanPageContent({
  initialPlan,
  initialDays,
  initialLogs,
}: PlanPageContentProps) {
  const t = useTranslations('plan')
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('week')

  const plan = initialPlan
  const days = initialDays
  const logs = initialLogs

  const tabs: { key: Tab; label: string }[] = [
    { key: 'week', label: t('tabs.week') },
    { key: 'month', label: t('tabs.month') },
    { key: 'history', label: t('tabs.history') },
  ]

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back to dashboard */}
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>

          {plan && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary">{plan.title}</h1>
              {plan.description && (
                <p className="text-sm text-text-secondary mt-1">{plan.description}</p>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-dark-surface border border-dark-border mb-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${activeTab === tab.key
                    ? 'bg-accent-primary text-dark-bg'
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-border/50'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="rounded-xl border border-dark-border bg-dark-surface p-4 sm:p-6">
            {!plan && (
              <p className="text-text-muted text-center py-8">{t('noPlan.message')}</p>
            )}
            {plan && activeTab === 'week' && (
              <WeeklyView plan={plan} days={days} logs={logs} />
            )}
            {plan && activeTab === 'month' && (
              <MonthlyCalendar plan={plan} days={days} logs={logs} />
            )}
            {activeTab === 'history' && (
              <PlanHistory />
            )}
          </div>
        </div>
      </main>
    </>
  )
}
```

**Step 2: Commit**

```bash
git add components/plan/PlanPageContent.tsx
git commit -m "feat: add PlanPageContent with tabs for week, month, history"
```

---

### Task 13: Create placeholder pages for stats and achievements

**Files:**
- Create: `app/app/stats/page.tsx`
- Create: `app/app/achievements/page.tsx`

**Step 1: Create stats placeholder**

```typescript
import Header from '@/components/Header'
import { BarChart3 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function StatsPage() {
  const t = await getTranslations('dashboard')

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="rounded-xl border-2 border-dashed border-dark-border bg-dark-surface p-12 text-center">
            <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">{t('stats.viewAll')}</h2>
            <p className="text-sm text-text-secondary">{t('comingSoonPage')}</p>
          </div>
        </div>
      </main>
    </>
  )
}
```

**Step 2: Create achievements placeholder**

```typescript
import Header from '@/components/Header'
import { Trophy } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function AchievementsPage() {
  const t = await getTranslations('dashboard')

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="rounded-xl border-2 border-dashed border-dark-border bg-dark-surface p-12 text-center">
            <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">{t('achievements.viewAll')}</h2>
            <p className="text-sm text-text-secondary">{t('comingSoonPage')}</p>
          </div>
        </div>
      </main>
    </>
  )
}
```

**Step 3: Commit**

```bash
git add app/app/stats/page.tsx app/app/achievements/page.tsx
git commit -m "feat: add placeholder pages for stats and achievements"
```

---

### Task 14: Verify build

**Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

**Step 2: Run lint**

```bash
npm run lint
```

Expected: No new lint errors.

**Step 3: Fix any issues and commit**

If there are build/lint errors, fix them and commit:

```bash
git add -A
git commit -m "fix: resolve build/lint issues from dashboard redesign"
```

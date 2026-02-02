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

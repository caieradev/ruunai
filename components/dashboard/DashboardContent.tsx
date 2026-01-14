'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Activity, Calendar, TrendingUp, Settings, LogOut } from 'lucide-react'

interface DashboardContentProps {
  fullName: string | null
}

export default function DashboardContent({ fullName }: DashboardContentProps) {
  const router = useRouter()
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const [loading, setLoading] = useState<'reset' | 'logout' | null>(null)

  const handleResetOnboarding = async () => {
    if (!confirm(t('resetConfirm'))) {
      return
    }

    setLoading('reset')
    try {
      const response = await fetch('/api/onboarding/clear_responses', {
        method: 'POST',
      })

      if (response.ok) {
        // Clear any local storage
        localStorage.removeItem('ruunai_onboarding_data')
        localStorage.removeItem('ruunai_onboarding_step')
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Failed to reset onboarding:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleLogout = async () => {
    setLoading('logout')
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Clear any local storage
        localStorage.removeItem('ruunai_onboarding_data')
        localStorage.removeItem('ruunai_onboarding_step')
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to logout:', error)
    } finally {
      setLoading(null)
    }
  }

  const stats = [
    { icon: Activity, label: t('weeklyDistance'), value: '0 km', color: 'text-accent-primary' },
    { icon: Calendar, label: t('trainingDays'), value: '0/7', color: 'text-accent-secondary' },
    { icon: TrendingUp, label: t('progress'), value: '0%', color: 'text-accent-primary' },
  ]

  const displayName = fullName || tCommon('runner')

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
              {t('welcomeBack')} <span className="gradient-text">{displayName}</span>
            </h1>
            <p className="text-text-secondary">{t('tagline')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
            {stats.map((stat, index) => (
              <Card key={index}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-dark-border ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
            <Card>
              <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-primary" />
                {t('yourTrainingPlan')}
              </h2>
              <div className="py-12 text-center">
                <p className="text-text-muted mb-4">{t('planPlaceholder')}</p>
                <p className="text-sm text-text-secondary">
                  {t('planBuilding')}
                </p>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-primary" />
                {t('recentActivity')}
              </h2>
              <div className="py-12 text-center">
                <p className="text-text-muted mb-4">{t('noActivities')}</p>
                <p className="text-sm text-text-secondary">
                  {t('connectApp')}
                </p>
              </div>
            </Card>
          </div>

          <Card className="mt-8 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-dark-border">
                <Settings className="w-6 h-6 text-accent-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-2">{t('quickActions')}</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm">
                    {t('updateProfile')}
                  </Button>
                  <Button variant="secondary" size="sm">
                    {t('adjustPlan')}
                  </Button>
                  <Button variant="secondary" size="sm">
                    {t('connectAppBtn')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetOnboarding}
                    disabled={loading === 'reset'}
                  >
                    {loading === 'reset' ? t('resetting') : t('resetOnboarding')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    disabled={loading === 'logout'}
                    className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    {loading === 'logout' ? t('loggingOut') : t('logOut')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-8 p-6 rounded-lg border-2 border-accent-primary/20 bg-accent-primary/5 animate-slide-up">
            <h3 className="text-lg font-semibold text-text-primary mb-2">{t('comingSoon')}</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• {t('comingSoonItems.aiPlans')}</li>
              <li>• {t('comingSoonItems.realTime')}</li>
              <li>• {t('comingSoonItems.integration')}</li>
              <li>• {t('comingSoonItems.analytics')}</li>
              <li>• {t('comingSoonItems.export')}</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}

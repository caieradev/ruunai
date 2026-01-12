'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Activity, Calendar, TrendingUp, Settings } from 'lucide-react'

export default function AppPage() {
  const router = useRouter()

  const handleResetOnboarding = () => {
    if (confirm('Are you sure you want to reset your onboarding and start over?')) {
      // Clear localStorage
      localStorage.removeItem('ruunai_onboarding_data')
      localStorage.removeItem('ruunai_onboarding_step')
      router.push('/')
    }
  }

  const stats = [
    { icon: Activity, label: 'Weekly Distance', value: '0 km', color: 'text-accent-primary' },
    { icon: Calendar, label: 'Training Days', value: '0/7', color: 'text-accent-secondary' },
    { icon: TrendingUp, label: 'Progress', value: '0%', color: 'text-accent-primary' },
  ]

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
              Welcome to <span className="gradient-text">RuunAI</span>
            </h1>
            <p className="text-text-secondary">Your personalized training dashboard</p>
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
                Your Training Plan
              </h2>
              <div className="py-12 text-center">
                <p className="text-text-muted mb-4">Your AI-generated training plan will appear here</p>
                <p className="text-sm text-text-secondary">
                  We're building your personalized plan based on your profile
                </p>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-primary" />
                Recent Activity
              </h2>
              <div className="py-12 text-center">
                <p className="text-text-muted mb-4">No activities yet</p>
                <p className="text-sm text-text-secondary">
                  Connect your running app to see your workouts here
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
                <h3 className="text-lg font-semibold text-text-primary mb-2">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm">
                    Update Profile
                  </Button>
                  <Button variant="secondary" size="sm">
                    Adjust Plan
                  </Button>
                  <Button variant="secondary" size="sm">
                    Connect App
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetOnboarding}
                  >
                    Reset Onboarding
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-8 p-6 rounded-lg border-2 border-accent-primary/20 bg-accent-primary/5 animate-slide-up">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Coming Soon
            </h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• AI-generated personalized training plans</li>
              <li>• Real-time plan adjustments based on your progress</li>
              <li>• Integration with Strava, Garmin, and other running apps</li>
              <li>• Detailed analytics and performance insights</li>
              <li>• Training plan export (PDF, Calendar)</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}

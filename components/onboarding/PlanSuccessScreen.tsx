'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

interface PlanSuccessScreenProps {
  isLoggedIn: boolean
  onSaveAndContinue?: () => Promise<void>
}

export default function PlanSuccessScreen({
  isLoggedIn,
  onSaveAndContinue,
}: PlanSuccessScreenProps) {
  const router = useRouter()

  const fireConfetti = useCallback(() => {
    const duration = 1000
    const end = Date.now() + duration

    // Classic rainbow party colors
    const colors = ['#ff0000', '#ff7700', '#ffdd00', '#00ff00', '#00ddff', '#0077ff', '#aa00ff', '#ff00aa']

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    // Initial burst
    confetti({
      particleCount: 35,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    })

    frame()
  }, [])

  useEffect(() => {
    // Fire confetti on mount
    fireConfetti()
  }, [fireConfetti])

  const handleCreateAccount = () => {
    router.push('/login?mode=signup')
  }

  const handleLogin = () => {
    router.push('/login?mode=login')
  }

  const handleGoToDashboard = async () => {
    if (onSaveAndContinue) {
      await onSaveAndContinue()
    }
    router.push('/app')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md text-center animate-fade-in">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-accent-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
            Your Plan is Ready!
          </h2>
          <p className="text-text-secondary">
            We&apos;ve created a personalized training plan just for you.
          </p>
        </div>

        {!isLoggedIn ? (
          <>
            <div className="p-4 mb-6 rounded-lg bg-dark-border/50 border border-dark-border">
              <p className="text-sm text-text-secondary">
                Create an account to save your plan and access it anywhere.
              </p>
            </div>

            <div className="space-y-3">
              <Button variant="primary" className="w-full" size="lg" onClick={handleCreateAccount}>
                Create Account
              </Button>
              <Button variant="secondary" className="w-full" onClick={handleLogin}>
                I already have an account
              </Button>
            </div>
          </>
        ) : (
          <Button variant="primary" className="w-full" size="lg" onClick={handleGoToDashboard}>
            View My Dashboard
          </Button>
        )}
      </Card>
    </div>
  )
}

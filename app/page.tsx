'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function WelcomePage() {
  const router = useRouter()
  const t = useTranslations('welcome')

  useEffect(() => {
    // Redirect to onboarding on desktop
    const checkScreenSize = () => {
      if (window.innerWidth >= 768) {
        router.push('/onboarding')
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [router])

  return (
    <main className="md:hidden min-h-screen flex flex-col px-4 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl" />

      {/* Content centered */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-6xl font-bold tracking-tight">
            <span className="inline-block animate-heartbeat">
              Ruun<span className="gradient-text">AI</span>
            </span>
          </h1>
          <p className="text-xl text-text-secondary max-w-md px-4">
            {t('tagline')}
          </p>
        </div>
      </div>

      {/* Buttons at bottom with safe area */}
      <div className="relative z-10 pb-8 space-y-3 pt-8">
        <Link href="/onboarding" className="block">
          <Button size="lg" className="w-full">
            {t('startJourney')}
          </Button>
        </Link>
        <Link href="/login" className="block">
          <Button variant="secondary" size="lg" className="w-full">
            {t('logIn')}
          </Button>
        </Link>
      </div>
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const STORAGE_KEY = 'ruunai_onboarding_data'
const STEP_KEY = 'ruunai_onboarding_step'

type Status = 'loading' | 'submitting' | 'success' | 'error'

export default function ConfirmPage() {
  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function handleConfirmation() {
      const supabase = getSupabaseBrowserClient()

      // Get the session - Supabase handles the token from the URL hash automatically
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        setErrorMessage(error?.message ?? 'Failed to verify your account. Please try again.')
        setStatus('error')
        return
      }

      // Check for localStorage draft
      const draft = localStorage.getItem(STORAGE_KEY)

      if (draft) {
        setStatus('submitting')
        try {
          const payload = JSON.parse(draft)

          const response = await fetch('/api/onboarding/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload }),
          })

          if (response.ok) {
            // Clear localStorage
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(STEP_KEY)
            setStatus('success')
            // Redirect after a brief moment to show success
            setTimeout(() => router.push('/app'), 1500)
            return
          } else {
            // Submission failed, but user is verified - redirect anyway
            console.error('Failed to submit onboarding data')
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(STEP_KEY)
            router.push('/app')
            return
          }
        } catch (e) {
          console.error('Failed to submit draft:', e)
          // Clear draft and redirect anyway
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(STEP_KEY)
          router.push('/app')
          return
        }
      }

      // No draft - check user status and redirect accordingly
      try {
        const meResponse = await fetch('/api/me')
        const me = await meResponse.json()

        if (me.has_responses) {
          router.push('/app')
        } else {
          router.push('/onboarding')
        }
      } catch {
        router.push('/app')
      }
    }

    handleConfirmation()
  }, [router])

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Verifying your account</h2>
              <p className="text-text-secondary">Please wait...</p>
            </>
          )}

          {status === 'submitting' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Saving your plan</h2>
              <p className="text-text-secondary">Almost there...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-accent-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">All set!</h2>
              <p className="text-text-secondary">Redirecting to your dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Something went wrong</h2>
              <p className="text-text-secondary mb-6">
                {errorMessage ?? 'We couldn\'t verify your account.'}
              </p>
              <Button variant="primary" onClick={() => router.push('/login')} className="w-full">
                Try logging in again
              </Button>
            </>
          )}
        </Card>
      </main>
    </>
  )
}

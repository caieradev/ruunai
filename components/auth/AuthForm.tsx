'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Mail } from 'lucide-react'

interface AuthFormProps {
  mode: 'login' | 'signup'
  redirectTo?: string
}

const STORAGE_KEY = 'ruunai_onboarding_data'
const STEP_KEY = 'ruunai_onboarding_step'

export default function AuthForm({ mode: initialMode, redirectTo = '/app' }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCheckEmail, setShowCheckEmail] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const router = useRouter()

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = getSupabaseBrowserClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setShowCheckEmail(true)
      setResendCooldown(60)
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Check for localStorage draft and submit it
      const draft = localStorage.getItem(STORAGE_KEY)
      if (draft) {
        try {
          const payload = JSON.parse(draft)
          const response = await fetch('/api/onboarding/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload }),
          })

          if (response.ok) {
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(STEP_KEY)
          }
        } catch (e) {
          console.error('Failed to submit draft on login:', e)
        }
      }

      router.push(redirectTo)
    }

    setLoading(false)
  }

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError(null)

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setResendCooldown(60)
    }

    setLoading(false)
  }

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode)
    setError(null)
    setShowCheckEmail(false)
  }

  if (showCheckEmail) {
    return (
      <Card className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <Mail className="w-8 h-8 text-accent-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Check your email</h2>
        <p className="text-text-secondary mb-2">
          We sent a confirmation link to <strong className="text-text-primary">{email}</strong>
        </p>
        <p className="text-sm text-text-muted mb-6">
          Click the link in your email to activate your account. Also check your spam folder.
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <Button
          variant="secondary"
          onClick={handleResendEmail}
          disabled={loading || resendCooldown > 0}
          className="w-full"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
        </Button>

        <button
          onClick={() => setShowCheckEmail(false)}
          className="mt-4 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Use a different email
        </button>
      </Card>
    )
  }

  return (
    <Card>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-text-secondary">
          {mode === 'signup'
            ? 'Save your plan and track your progress'
            : 'Log in to access your training plan'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'signup' && (
          <Input
            type="text"
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        )}

        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : 'Log In'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-accent-primary hover:text-accent-hover transition-colors"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => switchMode('signup')}
                className="text-accent-primary hover:text-accent-hover transition-colors"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </Card>
  )
}

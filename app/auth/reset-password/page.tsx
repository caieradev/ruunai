'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { CheckCircle, AlertCircle, Loader2, KeyRound } from 'lucide-react'

type Status = 'loading' | 'form' | 'submitting' | 'success' | 'error'

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const t = useTranslations('auth')

  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setStatus('form')
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError(t('passwordTooShort'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch'))
      return
    }

    setStatus('submitting')

    const supabase = getSupabaseBrowserClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setStatus('form')
      return
    }

    setStatus('success')
    setTimeout(() => router.push('/app'), 1500)
  }

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
              <h2 className="text-2xl font-bold text-text-primary mb-2">{t('loading')}</h2>
            </>
          )}

          {(status === 'form' || status === 'submitting') && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-accent-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">{t('resetPasswordTitle')}</h2>
              <p className="text-text-secondary mb-6">{t('resetPasswordPageDescription')}</p>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <Input
                  type="password"
                  label={t('newPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholderCreate')}
                  required
                />

                <Input
                  type="password"
                  label={t('confirmNewPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  required
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" className="w-full" size="lg" disabled={status === 'submitting'}>
                  {status === 'submitting' ? t('loading') : t('setNewPassword')}
                </Button>
              </form>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-accent-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">{t('passwordUpdated')}</h2>
              <p className="text-text-secondary">{t('passwordUpdatedDescription')}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">{t('resetPasswordTitle')}</h2>
              <p className="text-text-secondary mb-6">{error}</p>
              <Button variant="primary" onClick={() => router.push('/login')} className="w-full">
                {t('backToLogin')}
              </Button>
            </>
          )}
        </Card>
      </main>
    </>
  )
}

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import AuthForm from '@/components/auth/AuthForm'

function LoginContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const redirect = searchParams.get('redirect') ?? '/app'

  return (
    <div className="w-full max-w-md animate-fade-in">
      <AuthForm mode={mode} redirectTo={redirect} />
    </div>
  )
}

export default function LoginPage() {
  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="w-full max-w-md animate-fade-in">
              <div className="h-96 bg-dark-surface rounded-xl animate-pulse" />
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </main>
    </>
  )
}

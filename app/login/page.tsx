'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    console.log('=== LOGIN ATTEMPT ===')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('====================')

    // Simulate successful login
    alert('Login successful! (This is a placeholder)')
    router.push('/app')
  }

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md animate-fade-in">
          <Card>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h1>
              <p className="text-text-secondary">Log in to access your training plan</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your password"
                required
              />

              <Button type="submit" className="w-full" size="lg">
                Log in
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary">
                Don't have an account?{' '}
                <Link href="/onboarding" className="text-accent-primary hover:text-accent-hover transition-colors">
                  Start onboarding
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm text-text-muted hover:text-text-secondary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}

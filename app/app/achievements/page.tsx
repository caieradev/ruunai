import Header from '@/components/Header'
import { Trophy, ChevronLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function AchievementsPage() {
  const t = await getTranslations('dashboard')

  return (
    <>
      <Header showLogin={false} />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="rounded-xl border-2 border-dashed border-dark-border bg-dark-surface p-12 text-center">
            <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">{t('achievements.viewAll')}</h2>
            <p className="text-sm text-text-secondary">{t('comingSoonPage')}</p>
          </div>
        </div>
      </main>
    </>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { AlertCircle, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/plan/utils'

interface ExpiredPlanBannerProps {
  endDate: string
  onGenerateNew: () => void
}

export default function ExpiredPlanBanner({ endDate, onGenerateNew }: ExpiredPlanBannerProps) {
  const t = useTranslations('dashboard.expiredBanner')
  const locale = useLocale()

  const date = new Date(endDate + 'T00:00:00')

  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
        <p className="text-sm text-yellow-200">
          {t('message', { date: formatDate(date, locale) })}
        </p>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={onGenerateNew}
        className="flex items-center gap-2 shrink-0"
      >
        <Plus className="w-4 h-4" />
        {t('generate')}
      </Button>
    </div>
  )
}

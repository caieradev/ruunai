'use client'

import { useTranslations } from 'next-intl'
import { Moon } from 'lucide-react'

export default function RestDayCard() {
  const t = useTranslations('plan')

  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-dark-border/50 flex items-center justify-center">
          <Moon className="w-7 h-7 text-text-muted" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {t('restDay.title')}
      </h3>
      <p className="text-sm text-text-secondary max-w-xs mx-auto">
        {t('restDay.message')}
      </p>
    </div>
  )
}

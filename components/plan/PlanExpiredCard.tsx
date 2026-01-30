'use client'

import { useTranslations } from 'next-intl'
import Button from '@/components/ui/Button'
import { RefreshCw } from 'lucide-react'

interface PlanExpiredCardProps {
  onGenerateNew: () => void
}

export default function PlanExpiredCard({ onGenerateNew }: PlanExpiredCardProps) {
  const t = useTranslations('plan')

  return (
    <div className="rounded-xl border-2 border-accent-primary/30 bg-dark-surface p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-accent-primary/20 flex items-center justify-center">
          <RefreshCw className="w-7 h-7 text-accent-primary" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">
        {t('expired.title')}
      </h3>
      <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
        {t('expired.message')}
      </p>
      <Button variant="primary" onClick={onGenerateNew}>
        {t('actions.generateNew')}
      </Button>
    </div>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import Input from '@/components/ui/Input'
import TimeInput from '@/components/ui/TimeInput'
import PaceInput from '@/components/ui/PaceInput'

export default function EventDetailsStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.eventDetails')

  const highlight = (chunks: React.ReactNode) => (
    <span className="text-accent-primary font-semibold">{chunks}</span>
  )

  return (
    <div className="space-y-6 w-full min-w-0">
      <Input
        type="date"
        label={t.rich('eventDate', { highlight })}
        value={data.eventDate || ''}
        onChange={(e) => updateData({ eventDate: e.target.value })}
        placeholder={t('eventDatePlaceholder')}
      />
      <TimeInput
        label={t.rich('targetTime', { highlight })}
        value={data.targetTime || ''}
        onChange={(value) => updateData({ targetTime: value })}
        placeholder={t('targetTimePlaceholder')}
      />
      <PaceInput
        label={t.rich('targetPace', { highlight })}
        value={data.targetPace || ''}
        onChange={(value) => updateData({ targetPace: value })}
        placeholder={t('targetPacePlaceholder')}
      />
      <p className="text-sm text-text-muted">
        {t('hint')}
      </p>
    </div>
  )
}

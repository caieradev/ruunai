'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import TimeInput from '@/components/ui/TimeInput'
import PaceInput from '@/components/ui/PaceInput'

export default function AdvancedFitnessStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.advancedFitness')

  return (
    <div className="space-y-6">
      <TimeInput
        label={t('recent5k')}
        value={data.recentBest5K || ''}
        onChange={(value) => updateData({ recentBest5K: value })}
        placeholder={t('recent5kPlaceholder')}
      />
      <TimeInput
        label={t('recent10k')}
        value={data.recentBest10K || ''}
        onChange={(value) => updateData({ recentBest10K: value })}
        placeholder={t('recent10kPlaceholder')}
      />
      <PaceInput
        label={t('recentEasyPace')}
        value={data.recentEasyPace || ''}
        onChange={(value) => updateData({ recentEasyPace: value })}
        placeholder={t('recentEasyPacePlaceholder')}
      />
      <p className="text-sm text-text-muted">
        {t('hint')}
      </p>
    </div>
  )
}

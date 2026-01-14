'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'
import { WeeklyVolume } from '@/lib/onboarding/types'

export default function WeeklyVolumeStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.volume')

  const volumeOptions = [
    { value: '0_5', label: t('0_5'), description: t('0_5Desc') },
    { value: '5_15', label: t('5_15'), description: t('5_15Desc') },
    { value: '15_30', label: t('15_30'), description: t('15_30Desc') },
    { value: '30_50', label: t('30_50'), description: t('30_50Desc') },
    { value: '50_PLUS', label: t('50_plus'), description: t('50_plusDesc') },
  ]

  return (
    <div className="space-y-6">
      <RadioGroup
        options={volumeOptions}
        value={data.weeklyVolume || ''}
        onChange={(value) => updateData({ weeklyVolume: value as WeeklyVolume })}
        name="volume"
      />
    </div>
  )
}

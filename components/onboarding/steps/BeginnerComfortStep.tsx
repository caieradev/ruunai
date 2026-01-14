'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'

export default function BeginnerComfortStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.comfort')

  const comfortOptions = [
    { value: 'yes', label: t('yes'), description: t('yesDesc') },
    { value: 'no', label: t('no'), description: t('noDesc') },
  ]

  return (
    <div className="space-y-6">
      <RadioGroup
        options={comfortOptions}
        value={data.canRun20MinsContinuously === true ? 'yes' : data.canRun20MinsContinuously === false ? 'no' : ''}
        onChange={(value) => updateData({ canRun20MinsContinuously: value === 'yes' })}
        name="comfort"
      />
    </div>
  )
}

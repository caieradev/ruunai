'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'

export default function DaysPerWeekStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.daysPerWeek')

  const daysOptions = [
    { value: '2', label: t('2'), description: t('2Desc') },
    { value: '3', label: t('3'), description: t('3Desc') },
    { value: '4', label: t('4'), description: t('4Desc') },
    { value: '5', label: t('5'), description: t('5Desc') },
    { value: '6', label: t('6'), description: t('6Desc') },
    { value: '7', label: t('7'), description: t('7Desc') },
  ]

  return (
    <div className="space-y-6">
      <RadioGroup
        options={daysOptions}
        value={data.daysPerWeek?.toString() || ''}
        onChange={(value) => updateData({ daysPerWeek: parseInt(value) })}
        name="days"
      />
    </div>
  )
}

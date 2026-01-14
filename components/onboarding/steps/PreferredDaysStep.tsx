'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import Checkbox from '@/components/ui/Checkbox'

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export default function PreferredDaysStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding')
  const selectedDays = data.preferredDays || []

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day]
    updateData({ preferredDays: newDays })
  }

  return (
    <div className="space-y-3">
      {dayKeys.map((dayKey) => {
        const dayLabel = t(`weekDays.${dayKey}`)
        return (
          <Checkbox
            key={dayKey}
            label={dayLabel}
            checked={selectedDays.includes(dayKey)}
            onChange={() => toggleDay(dayKey)}
          />
        )
      })}
      <p className="text-sm text-text-muted mt-6">
        {t('preferredDaysHint')}
      </p>
    </div>
  )
}

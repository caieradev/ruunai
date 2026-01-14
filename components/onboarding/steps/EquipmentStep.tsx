'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import Checkbox from '@/components/ui/Checkbox'

export default function EquipmentStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.equipment')
  const selectedEquipment = data.equipment || []

  const equipmentOptions = [
    { value: 'treadmill', label: t('treadmill'), description: t('treadmillDesc') },
    { value: 'track', label: t('track'), description: t('trackDesc') },
    { value: 'gym', label: t('gym'), description: t('gymDesc') },
    { value: 'hills', label: t('hills'), description: t('hillsDesc') },
  ]

  const toggleEquipment = (equipment: string) => {
    const newEquipment = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter((e) => e !== equipment)
      : [...selectedEquipment, equipment]
    updateData({ equipment: newEquipment })
  }

  return (
    <div className="space-y-3">
      {equipmentOptions.map((option) => (
        <Checkbox
          key={option.value}
          label={option.label}
          description={option.description}
          checked={selectedEquipment.includes(option.value)}
          onChange={() => toggleEquipment(option.value)}
        />
      ))}
      <p className="text-sm text-text-muted mt-6">
        {t('hint')}
      </p>
    </div>
  )
}

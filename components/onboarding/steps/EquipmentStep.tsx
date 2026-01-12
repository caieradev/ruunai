'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import Checkbox from '@/components/ui/Checkbox'

const equipmentOptions = [
  { value: 'treadmill', label: 'Treadmill', description: 'Access to indoor running' },
  { value: 'track', label: 'Track', description: 'Access to a running track' },
  { value: 'gym', label: 'Gym', description: 'Gym membership for cross-training' },
  { value: 'hills', label: 'Hills/Trails', description: 'Access to varied terrain' },
]

export default function EquipmentStep() {
  const { data, updateData } = useOnboarding()
  const selectedEquipment = data.equipment || []

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
        This is optional. We can create a great plan with just outdoor running.
      </p>
    </div>
  )
}

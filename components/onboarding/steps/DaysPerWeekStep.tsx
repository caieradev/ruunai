'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'

const daysOptions = [
  { value: '2', label: '2 days', description: 'Minimal commitment' },
  { value: '3', label: '3 days', description: 'Good for beginners' },
  { value: '4', label: '4 days', description: 'Balanced approach' },
  { value: '5', label: '5 days', description: 'Serious training' },
  { value: '6', label: '6 days', description: 'Advanced training' },
  { value: '7', label: '7 days', description: 'Daily runner' },
]

export default function DaysPerWeekStep() {
  const { data, updateData } = useOnboarding()

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

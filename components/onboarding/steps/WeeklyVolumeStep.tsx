'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'
import { WeeklyVolume } from '@/lib/onboarding/types'

const volumeOptions = [
  { value: '0_5', label: '0-5 km', description: 'Just starting out' },
  { value: '5_15', label: '5-15 km', description: 'Building consistency' },
  { value: '15_30', label: '15-30 km', description: 'Solid base' },
  { value: '30_50', label: '30-50 km', description: 'Strong weekly volume' },
  { value: '50_PLUS', label: '50+ km', description: 'High mileage training' },
]

export default function WeeklyVolumeStep() {
  const { data, updateData } = useOnboarding()

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

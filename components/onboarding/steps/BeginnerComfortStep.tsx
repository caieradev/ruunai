'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'

const comfortOptions = [
  {
    value: 'yes',
    label: 'Yes, I can',
    description: 'I can run for 20 minutes without stopping',
  },
  {
    value: 'no',
    label: 'Not yet',
    description: 'I need to build up to that',
  },
]

export default function BeginnerComfortStep() {
  const { data, updateData } = useOnboarding()

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

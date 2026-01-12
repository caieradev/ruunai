'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'
import { Goal } from '@/lib/onboarding/types'

const goalOptions = [
  { value: '5K', label: '5K Race', description: 'Train for a 5 kilometer race' },
  { value: '10K', label: '10K Race', description: 'Train for a 10 kilometer race' },
  { value: 'HALF_MARATHON', label: 'Half Marathon', description: 'Train for a 21.1km race' },
  { value: 'MARATHON', label: 'Marathon', description: 'Train for a full 42.2km marathon' },
  { value: 'GENERAL_FITNESS', label: 'General Fitness', description: 'Build a running habit and improve overall fitness' },
]

export default function GoalStep() {
  const { data, updateData } = useOnboarding()

  return (
    <div className="space-y-6">
      <RadioGroup
        options={goalOptions}
        value={data.goal || ''}
        onChange={(value) => updateData({ goal: value as Goal })}
        name="goal"
      />
    </div>
  )
}

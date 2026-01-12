'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'
import { ExperienceLevel } from '@/lib/onboarding/types'

const experienceOptions = [
  {
    value: 'BEGINNER',
    label: 'Beginner',
    description: 'New to running or returning after a long break',
  },
  {
    value: 'INTERMEDIATE',
    label: 'Intermediate',
    description: 'Running regularly for several months',
  },
  {
    value: 'ADVANCED',
    label: 'Advanced',
    description: 'Experienced runner with consistent training',
  },
]

export default function ExperienceStep() {
  const { data, updateData } = useOnboarding()

  return (
    <div className="space-y-6">
      <RadioGroup
        options={experienceOptions}
        value={data.experienceLevel || ''}
        onChange={(value) => updateData({ experienceLevel: value as ExperienceLevel })}
        name="experience"
      />
    </div>
  )
}

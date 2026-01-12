'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'
import { PlanStyle, PlanFlexibility, IntensityTolerance } from '@/lib/onboarding/types'

const styleOptions = [
  {
    value: 'TIME_BASED',
    label: 'Time-based',
    description: 'Workouts specified by duration (e.g., run 30 minutes)',
  },
  {
    value: 'DISTANCE_BASED',
    label: 'Distance-based',
    description: 'Workouts specified by distance (e.g., run 5 km)',
  },
]

const flexibilityOptions = [
  {
    value: 'STRUCTURED',
    label: 'Structured',
    description: 'Specific workouts on specific days',
  },
  {
    value: 'FLEXIBLE',
    label: 'Flexible',
    description: 'You choose which workout to do each day',
  },
]

const intensityOptions = [
  { value: 'LOW', label: 'Low', description: 'Gradual progression, more recovery' },
  { value: 'MEDIUM', label: 'Medium', description: 'Balanced approach' },
  { value: 'HIGH', label: 'High', description: 'Aggressive progression, push limits' },
]

export default function PlanPreferencesStep() {
  const { data, updateData } = useOnboarding()

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Plan Style</h3>
        <RadioGroup
          options={styleOptions}
          value={data.planStyle || ''}
          onChange={(value) => updateData({ planStyle: value as PlanStyle })}
          name="style"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Flexibility</h3>
        <RadioGroup
          options={flexibilityOptions}
          value={data.planFlexibility || ''}
          onChange={(value) => updateData({ planFlexibility: value as PlanFlexibility })}
          name="flexibility"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Intensity Tolerance</h3>
        <RadioGroup
          options={intensityOptions}
          value={data.intensityTolerance || ''}
          onChange={(value) => updateData({ intensityTolerance: value as IntensityTolerance })}
          name="intensity"
        />
      </div>
    </div>
  )
}

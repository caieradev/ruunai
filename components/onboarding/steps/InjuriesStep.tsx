'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import CheckboxGroup from '@/components/ui/CheckboxGroup'
import Input from '@/components/ui/Input'
import { InjuryType } from '@/lib/onboarding/types'

const injuryOptions = [
  { value: 'NONE', label: 'No injuries', description: 'Currently injury-free' },
  { value: 'KNEE', label: 'Knee issues', description: 'Current or recent knee problems' },
  { value: 'SHIN', label: 'Shin splints', description: 'Shin pain or sensitivity' },
  { value: 'FOOT', label: 'Foot problems', description: 'Plantar fasciitis or similar' },
  { value: 'OTHER', label: 'Other', description: 'Specify below' },
]

export default function InjuriesStep() {
  const { data, updateData } = useOnboarding()

  const handleInjuryChange = (values: string[]) => {
    // If "NONE" is selected, clear all other selections
    if (values.includes('NONE') && !data.injuryTypes?.includes('NONE')) {
      updateData({ injuryTypes: ['NONE'], injuryDetails: '' })
    }
    // If another option is selected while "NONE" is already selected, remove "NONE"
    else if (values.includes('NONE') && values.length > 1) {
      updateData({ injuryTypes: values.filter(v => v !== 'NONE') as InjuryType[] })
    }
    // Otherwise, just update normally
    else {
      updateData({ injuryTypes: values as InjuryType[] })
      // Clear injury details if OTHER is unselected
      if (!values.includes('OTHER')) {
        updateData({ injuryDetails: '' })
      }
    }
  }

  return (
    <div className="space-y-6">
      <CheckboxGroup
        options={injuryOptions}
        value={data.injuryTypes || []}
        onChange={handleInjuryChange}
        name="injuries"
      />

      {data.injuryTypes?.includes('OTHER') && (
        <Input
          type="text"
          label="Please describe"
          value={data.injuryDetails || ''}
          onChange={(e) => updateData({ injuryDetails: e.target.value })}
          placeholder="Tell us about your injury or limitation"
        />
      )}

      <p className="text-sm text-text-muted">
        We'll adjust your training to help prevent aggravating existing issues.
      </p>
    </div>
  )
}

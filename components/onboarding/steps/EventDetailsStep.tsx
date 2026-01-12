'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import Input from '@/components/ui/Input'
import TimeInput from '@/components/ui/TimeInput'
import PaceInput from '@/components/ui/PaceInput'

export default function EventDetailsStep() {
  const { data, updateData } = useOnboarding()

  return (
    <div className="space-y-6 w-full min-w-0">
      <Input
        type="date"
        label="Event Date (Optional)"
        value={data.eventDate || ''}
        onChange={(e) => updateData({ eventDate: e.target.value })}
        placeholder="Select your race date"
      />
      <TimeInput
        label="Target Time (Optional)"
        value={data.targetTime || ''}
        onChange={(value) => updateData({ targetTime: value })}
        placeholder="e.g., 50:00 or 1:30:25"
      />
      <PaceInput
        label="Target Pace (Optional)"
        value={data.targetPace || ''}
        onChange={(value) => updateData({ targetPace: value })}
        placeholder="e.g., 5:30/km"
      />
      <p className="text-sm text-text-muted">
        These details help us create a plan that peaks at the right time.
      </p>
    </div>
  )
}

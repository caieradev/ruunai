'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import TimeInput from '@/components/ui/TimeInput'
import PaceInput from '@/components/ui/PaceInput'

export default function AdvancedFitnessStep() {
  const { data, updateData } = useOnboarding()

  return (
    <div className="space-y-6">
      <TimeInput
        label="Recent Best 5K Time (Optional)"
        value={data.recentBest5K || ''}
        onChange={(value) => updateData({ recentBest5K: value })}
        placeholder="e.g., 22:30"
      />
      <TimeInput
        label="Recent Best 10K Time (Optional)"
        value={data.recentBest10K || ''}
        onChange={(value) => updateData({ recentBest10K: value })}
        placeholder="e.g., 48:00"
      />
      <PaceInput
        label="Recent Easy Pace (Optional)"
        value={data.recentEasyPace || ''}
        onChange={(value) => updateData({ recentEasyPace: value })}
        placeholder="e.g., 5:30/km"
      />
      <p className="text-sm text-text-muted">
        This helps us calibrate your training zones for optimal performance.
      </p>
    </div>
  )
}

'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import Input from '@/components/ui/Input'

export default function LongestRunStep() {
  const { data, updateData } = useOnboarding()

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      updateData({ noRecentRun: true, longestRecentRun: undefined })
    } else {
      updateData({ noRecentRun: false, longestRecentRun: undefined })
    }
  }

  return (
    <div className="space-y-6">
      <Input
        type="number"
        label="Distance (kilometers)"
        value={data.longestRecentRun?.toString() || ''}
        onChange={(e) => updateData({ longestRecentRun: parseFloat(e.target.value) || 0 })}
        placeholder="e.g., 10"
        min="0"
        step="0.1"
        disabled={data.noRecentRun}
      />
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.noRecentRun || false}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          className="w-5 h-5 rounded accent-accent-primary focus-ring cursor-pointer"
        />
        <span className="text-sm text-text-secondary">
          I don't have a recent long run
        </span>
      </label>
      <p className="text-sm text-text-muted">
        This helps us determine an appropriate starting point for your long runs.
      </p>
    </div>
  )
}

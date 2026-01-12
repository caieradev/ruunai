'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import Checkbox from '@/components/ui/Checkbox'

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export default function PreferredDaysStep() {
  const { data, updateData } = useOnboarding()
  const selectedDays = data.preferredDays || []

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day]
    updateData({ preferredDays: newDays })
  }

  return (
    <div className="space-y-3">
      {daysOfWeek.map((day) => (
        <Checkbox
          key={day}
          label={day}
          checked={selectedDays.includes(day)}
          onChange={() => toggleDay(day)}
        />
      ))}
      <p className="text-sm text-text-muted mt-6">
        Select your preferred training days. This is optional and flexible.
      </p>
    </div>
  )
}

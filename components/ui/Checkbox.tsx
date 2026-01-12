'use client'

import { cn } from '@/lib/utils'

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

export default function Checkbox({ label, checked, onChange, description }: CheckboxProps) {
  return (
    <label
      className={cn(
        'flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all',
        'hover:bg-dark-surface',
        checked
          ? 'border-accent-primary bg-dark-surface'
          : 'border-dark-border bg-transparent'
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 mr-3 h-4 w-4 accent-accent-primary focus-ring"
      />
      <div className="flex-1">
        <div className="font-medium text-text-primary">{label}</div>
        {description && (
          <div className="mt-1 text-sm text-text-secondary">{description}</div>
        )}
      </div>
    </label>
  )
}

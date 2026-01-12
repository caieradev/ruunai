'use client'

import { cn } from '@/lib/utils'

interface RadioOption {
  value: string
  label: string
  description?: string
}

interface RadioGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  name: string
}

export default function RadioGroup({ options, value, onChange, name }: RadioGroupProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all',
            'hover:bg-dark-surface',
            value === option.value
              ? 'border-accent-primary bg-dark-surface'
              : 'border-dark-border bg-transparent'
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 mr-3 h-4 w-4 accent-accent-primary focus-ring"
          />
          <div className="flex-1">
            <div className="font-medium text-text-primary">{option.label}</div>
            {option.description && (
              <div className="mt-1 text-sm text-text-secondary">{option.description}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'

interface CheckboxOption {
  value: string
  label: string
  description?: string
}

interface CheckboxGroupProps {
  options: CheckboxOption[]
  value: string[]
  onChange: (value: string[]) => void
  name: string
}

export default function CheckboxGroup({ options, value, onChange, name }: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue])
    } else {
      onChange(value.filter(v => v !== optionValue))
    }
  }

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isChecked = value.includes(option.value)

        return (
          <label
            key={option.value}
            className={cn(
              'flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all',
              'hover:bg-dark-surface',
              isChecked
                ? 'border-accent-primary bg-dark-surface'
                : 'border-dark-border bg-transparent'
            )}
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={isChecked}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              className="mt-1 mr-3 h-4 w-4 rounded accent-accent-primary focus-ring"
            />
            <div className="flex-1">
              <div className="font-medium text-text-primary">{option.label}</div>
              {option.description && (
                <div className="mt-1 text-sm text-text-secondary">{option.description}</div>
              )}
            </div>
          </label>
        )
      })}
    </div>
  )
}

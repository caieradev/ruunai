'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface PaceInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export default function PaceInput({
  label,
  value,
  onChange,
  placeholder = 'e.g., 5:30/km',
  error,
  className
}: PaceInputProps) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const formatPaceInput = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '')

    if (digits.length === 0) return ''

    // Format based on length
    if (digits.length <= 2) {
      // MM
      return digits
    } else {
      // MM:SS
      const minutes = digits.slice(0, -2)
      const seconds = digits.slice(-2)
      return `${minutes}:${seconds}`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatPaceInput(inputValue)
    setDisplayValue(formatted)
    onChange(formatted)
  }

  const validatePace = (pace: string): boolean => {
    if (!pace) return true // Empty is valid (optional field)

    const parts = pace.split(':')

    if (parts.length !== 2) return false

    // Validate each part is a number
    const isValidNumbers = parts.every(part => /^\d+$/.test(part))
    if (!isValidNumbers) return false

    const [minutes, seconds] = parts.map(Number)
    return seconds < 60
  }

  const isValid = validatePace(displayValue)

  return (
    <div className="w-full min-w-0">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full max-w-full min-w-0 rounded-lg border bg-dark-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors',
          'focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-dark-bg',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error || !isValid ? 'border-red-500' : 'border-dark-border',
          className
        )}
      />
      {(error || !isValid) && (
        <p className="mt-2 text-sm text-red-500">
          {error || 'Please enter a valid pace format (MM:SS/km)'}
        </p>
      )}
      <p className="mt-1 text-xs text-text-muted">
        Format: MM:SS/km (e.g., 5:30/km) - pace per kilometer
      </p>
    </div>
  )
}

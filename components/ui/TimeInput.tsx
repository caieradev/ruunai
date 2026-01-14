'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface TimeInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export default function TimeInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  className
}: TimeInputProps) {
  const t = useTranslations('inputs.time')
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const formatTimeInput = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '')

    if (digits.length === 0) return ''

    // Format based on length
    if (digits.length <= 2) {
      // MM
      return digits
    } else if (digits.length <= 4) {
      // MM:SS
      const minutes = digits.slice(0, -2)
      const seconds = digits.slice(-2)
      return `${minutes}:${seconds}`
    } else {
      // H:MM:SS or HH:MM:SS
      const seconds = digits.slice(-2)
      const minutes = digits.slice(-4, -2)
      const hours = digits.slice(0, -4)
      return `${hours}:${minutes}:${seconds}`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatTimeInput(inputValue)
    setDisplayValue(formatted)
    onChange(formatted)
  }

  const validateTime = (time: string): boolean => {
    if (!time) return true // Empty is valid (optional field)

    const parts = time.split(':')

    if (parts.length < 2 || parts.length > 3) return false

    // Validate each part is a number
    const isValidNumbers = parts.every(part => /^\d+$/.test(part))
    if (!isValidNumbers) return false

    // For MM:SS format
    if (parts.length === 2) {
      const [minutes, seconds] = parts.map(Number)
      return seconds < 60
    }

    // For H:MM:SS or HH:MM:SS format
    if (parts.length === 3) {
      const [, minutes, seconds] = parts.map(Number)
      return minutes < 60 && seconds < 60
    }

    return true
  }

  const isValid = validateTime(displayValue)

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
        placeholder={placeholder || t('placeholder')}
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
          {error || t('invalidFormat')}
        </p>
      )}
      <p className="mt-1 text-xs text-text-muted">
        {t('formatHint')}
      </p>
    </div>
  )
}

'use client'

import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { locales, localeNames, type Locale } from '@/lib/i18n/config'
import { setStoredLocale } from '@/lib/i18n/client'

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const [isPending, startTransition] = useTransition()

  const handleChange = (newLocale: Locale) => {
    startTransition(() => {
      setStoredLocale(newLocale)
      // Reload the page to apply the new locale
      window.location.reload()
    })
  }

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        disabled={isPending}
        className="appearance-none bg-transparent text-text-secondary hover:text-accent-primary transition-colors cursor-pointer pr-6 pl-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary rounded"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} className="bg-dark-surface text-text-primary">
            {localeNames[loc]}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-muted" />
    </div>
  )
}

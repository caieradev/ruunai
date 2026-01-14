import { locales, defaultLocale, LOCALE_COOKIE, LOCALE_STORAGE_KEY, type Locale } from './config'

export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale
  }
  return null
}

export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(LOCALE_STORAGE_KEY, locale)

  // Set cookie for server-side reading (1 year expiry)
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const browserLang = navigator.language.toLowerCase()

  // Map browser language to supported locales
  if (browserLang.startsWith('pt')) {
    return 'pt-BR'
  }
  if (browserLang.startsWith('es')) {
    return 'es'
  }

  return defaultLocale
}

export function getInitialLocale(): Locale {
  // 1. Check localStorage first
  const stored = getStoredLocale()
  if (stored) return stored

  // 2. Detect from browser
  const detected = detectBrowserLocale()

  // 3. Save for future visits
  setStoredLocale(detected)

  return detected
}

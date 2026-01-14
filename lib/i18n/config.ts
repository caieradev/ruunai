export const locales = ['en', 'pt-BR', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'
export const LOCALE_COOKIE = 'NEXT_LOCALE'
export const LOCALE_STORAGE_KEY = 'ruunai_language'

export const localeNames: Record<Locale, string> = {
  en: 'EN',
  'pt-BR': 'PT',
  es: 'ES',
}

export const localeFullNames: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português',
  es: 'Español',
}

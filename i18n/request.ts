import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { locales, defaultLocale, LOCALE_COOKIE, type Locale } from '@/lib/i18n/config'

function detectLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale

  // Parse Accept-Language header (e.g., "pt-BR,pt;q=0.9,en;q=0.8")
  const languages = acceptLanguage.split(',').map(lang => {
    const [code] = lang.trim().split(';')
    return code.toLowerCase()
  })

  for (const lang of languages) {
    if (lang.startsWith('pt')) return 'pt-BR'
    if (lang.startsWith('es')) return 'es'
    if (lang.startsWith('en')) return 'en'
  }

  return defaultLocale
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value

  let locale: Locale = defaultLocale

  if (localeCookie && locales.includes(localeCookie as Locale)) {
    // Use cookie if set
    locale = localeCookie as Locale
  } else {
    // Detect from Accept-Language header
    const headerStore = await headers()
    const acceptLanguage = headerStore.get('Accept-Language')
    locale = detectLocaleFromAcceptLanguage(acceptLanguage)
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  }
})

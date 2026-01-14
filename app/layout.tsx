import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://app.ruunai.com'),
  title: {
    default: 'RuunAI - Your AI Running Coach, Built for You',
    template: '%s | RuunAI',
  },
  description: 'Get a personalized running training plan powered by AI. Adaptive, data-driven coaching that evolves with your progress. Train smarter, run faster.',
  applicationName: 'RuunAI',
  keywords: [
    'running coach',
    'AI running coach',
    'personalized training plan',
    'marathon training',
    'running training',
    'adaptive training',
    'AI coach',
    'running app',
    'training schedule',
    '5k training',
    '10k training',
    'half marathon training',
    'running performance',
    'data-driven coaching',
  ],
  authors: [{ name: 'Caio Miguel Fernandes', url: 'https://ruunai.com' }],
  creator: 'Caio Miguel Fernandes',
  publisher: 'RuunAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://app.ruunai.com',
    siteName: 'RuunAI',
    title: 'RuunAI - Your AI Running Coach, Built for You',
    description: 'Get a personalized running training plan powered by AI. Adaptive, data-driven coaching that evolves with your progress. Train smarter, run faster.',
    images: [
      {
        url: 'https://app.ruunai.com/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RuunAI - Your AI Running Coach - Personalized training plans that adapt to you',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ruun_ai',
    creator: '@ruun_ai',
    title: 'RuunAI - Your AI Running Coach, Built for You',
    description: 'Get a personalized running training plan powered by AI. Adaptive, data-driven coaching that evolves with your progress. Train smarter, run faster.',
    images: {
      url: 'https://app.ruunai.com/images/og-image.png',
      alt: 'RuunAI - Your AI Running Coach - Personalized training plans that adapt to you',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: '', // Add your Google Search Console verification code here when ready
  },
  alternates: {
    canonical: 'https://app.ruunai.com',
  },
  category: 'Sports & Fitness',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'RuunAI',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Get a personalized running training plan powered by AI. Adaptive, data-driven coaching that evolves with your progress.',
    url: 'https://app.ruunai.com',
    image: 'https://app.ruunai.com/images/og-image.png',
    author: {
      '@type': 'Person',
      name: 'Caio Miguel Fernandes',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RuunAI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://app.ruunai.com/images/logo.svg',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
    FeatureList: [
      'AI-powered training plans',
      'Personalized running coaching',
      'Adaptive training schedules',
      'Data-driven insights',
      'Progress tracking',
    ],
  }

  return (
    <html lang={locale} className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

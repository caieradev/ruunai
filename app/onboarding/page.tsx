import { OnboardingProvider } from '@/lib/onboarding/context'
import Header from '@/components/Header'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <Header />
      <main>
        <OnboardingFlow />
      </main>
    </OnboardingProvider>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'
import { ExperienceLevel } from '@/lib/onboarding/types'

export default function ExperienceStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.experience')

  const experienceOptions = [
    { value: 'BEGINNER', label: t('beginner'), description: t('beginnerDesc') },
    { value: 'INTERMEDIATE', label: t('intermediate'), description: t('intermediateDesc') },
    { value: 'ADVANCED', label: t('advanced'), description: t('advancedDesc') },
  ]

  return (
    <div className="space-y-6">
      <RadioGroup
        options={experienceOptions}
        value={data.experienceLevel || ''}
        onChange={(value) => updateData({ experienceLevel: value as ExperienceLevel })}
        name="experience"
      />
    </div>
  )
}

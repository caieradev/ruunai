'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'
import { PlanStyle, PlanFlexibility, IntensityTolerance } from '@/lib/onboarding/types'

export default function PlanPreferencesStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.planPreferences')

  const styleOptions = [
    { value: 'TIME_BASED', label: t('timeBased'), description: t('timeBasedDesc') },
    { value: 'DISTANCE_BASED', label: t('distanceBased'), description: t('distanceBasedDesc') },
  ]

  const flexibilityOptions = [
    { value: 'STRUCTURED', label: t('structured'), description: t('structuredDesc') },
    { value: 'FLEXIBLE', label: t('flexible'), description: t('flexibleDesc') },
  ]

  const intensityOptions = [
    { value: 'LOW', label: t('low'), description: t('lowDesc') },
    { value: 'MEDIUM', label: t('medium'), description: t('mediumDesc') },
    { value: 'HIGH', label: t('high'), description: t('highDesc') },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">{t('planStyle')}</h3>
        <RadioGroup
          options={styleOptions}
          value={data.planStyle || ''}
          onChange={(value) => updateData({ planStyle: value as PlanStyle })}
          name="style"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">{t('flexibility')}</h3>
        <RadioGroup
          options={flexibilityOptions}
          value={data.planFlexibility || ''}
          onChange={(value) => updateData({ planFlexibility: value as PlanFlexibility })}
          name="flexibility"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">{t('intensityTolerance')}</h3>
        <RadioGroup
          options={intensityOptions}
          value={data.intensityTolerance || ''}
          onChange={(value) => updateData({ intensityTolerance: value as IntensityTolerance })}
          name="intensity"
        />
      </div>
    </div>
  )
}

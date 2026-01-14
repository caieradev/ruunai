'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import RadioGroup from '@/components/ui/RadioGroup'
import { Goal } from '@/lib/onboarding/types'

export default function GoalStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.goals')

  const goalOptions = [
    { value: '5K', label: t('5k'), description: t('5kDesc') },
    { value: '10K', label: t('10k'), description: t('10kDesc') },
    { value: 'HALF_MARATHON', label: t('halfMarathon'), description: t('halfMarathonDesc') },
    { value: 'MARATHON', label: t('marathon'), description: t('marathonDesc') },
    { value: 'GENERAL_FITNESS', label: t('generalFitness'), description: t('generalFitnessDesc') },
  ]

  return (
    <div className="space-y-6">
      <RadioGroup
        options={goalOptions}
        value={data.goal || ''}
        onChange={(value) => updateData({ goal: value as Goal })}
        name="goal"
      />
    </div>
  )
}

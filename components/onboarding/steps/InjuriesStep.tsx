'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import CheckboxGroup from '@/components/ui/CheckboxGroup'
import Input from '@/components/ui/Input'
import { InjuryType } from '@/lib/onboarding/types'

export default function InjuriesStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.injuries')

  const injuryOptions = [
    { value: 'NONE', label: t('none'), description: t('noneDesc') },
    { value: 'KNEE', label: t('knee'), description: t('kneeDesc') },
    { value: 'SHIN', label: t('shin'), description: t('shinDesc') },
    { value: 'FOOT', label: t('foot'), description: t('footDesc') },
    { value: 'OTHER', label: t('other'), description: t('otherDesc') },
  ]

  const handleInjuryChange = (values: string[]) => {
    // If "NONE" is selected, clear all other selections
    if (values.includes('NONE') && !data.injuryTypes?.includes('NONE')) {
      updateData({ injuryTypes: ['NONE'], injuryDetails: '' })
    }
    // If another option is selected while "NONE" is already selected, remove "NONE"
    else if (values.includes('NONE') && values.length > 1) {
      updateData({ injuryTypes: values.filter(v => v !== 'NONE') as InjuryType[] })
    }
    // Otherwise, just update normally
    else {
      updateData({ injuryTypes: values as InjuryType[] })
      // Clear injury details if OTHER is unselected
      if (!values.includes('OTHER')) {
        updateData({ injuryDetails: '' })
      }
    }
  }

  return (
    <div className="space-y-6">
      <CheckboxGroup
        options={injuryOptions}
        value={data.injuryTypes || []}
        onChange={handleInjuryChange}
        name="injuries"
      />

      {data.injuryTypes?.includes('OTHER') && (
        <Input
          type="text"
          label={t('pleaseDescribe')}
          value={data.injuryDetails || ''}
          onChange={(e) => updateData({ injuryDetails: e.target.value })}
          placeholder={t('describePlaceholder')}
        />
      )}

      <p className="text-sm text-text-muted">
        {t('hint')}
      </p>
    </div>
  )
}

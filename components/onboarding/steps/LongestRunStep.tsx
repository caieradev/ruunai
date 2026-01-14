'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import Input from '@/components/ui/Input'

export default function LongestRunStep() {
  const { data, updateData } = useOnboarding()
  const t = useTranslations('onboarding.longestRun')

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      updateData({ noRecentRun: true, longestRecentRun: undefined })
    } else {
      updateData({ noRecentRun: false, longestRecentRun: undefined })
    }
  }

  return (
    <div className="space-y-6">
      <Input
        type="number"
        label={t('distance')}
        value={data.longestRecentRun?.toString() || ''}
        onChange={(e) => updateData({ longestRecentRun: parseFloat(e.target.value) || 0 })}
        placeholder={t('distancePlaceholder')}
        min="0"
        step="0.1"
        disabled={data.noRecentRun}
      />
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.noRecentRun || false}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          className="w-5 h-5 rounded accent-accent-primary focus-ring cursor-pointer"
        />
        <span className="text-sm text-text-secondary">
          {t('noRecentRun')}
        </span>
      </label>
      <p className="text-sm text-text-muted">
        {t('hint')}
      </p>
    </div>
  )
}

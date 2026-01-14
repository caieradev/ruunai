'use client'

import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/lib/onboarding/context'
import Card from '@/components/ui/Card'

export default function ReviewStep() {
  const { data } = useOnboarding()
  const t = useTranslations('onboarding.review')
  const tGoals = useTranslations('onboarding.goals')
  const tExp = useTranslations('onboarding.experience')
  const tVol = useTranslations('onboarding.volume')
  const tInj = useTranslations('onboarding.injuries')
  const tPref = useTranslations('onboarding.planPreferences')
  const tDays = useTranslations('onboarding.weekDays')
  const tCommon = useTranslations('common')

  const formatGoal = (goal?: string) => {
    const goalMap: Record<string, string> = {
      '5K': tGoals('5k'),
      '10K': tGoals('10k'),
      'HALF_MARATHON': tGoals('halfMarathon'),
      'MARATHON': tGoals('marathon'),
      'GENERAL_FITNESS': tGoals('generalFitness'),
    }
    return goal ? goalMap[goal] : t('notSpecified')
  }

  const formatExperience = (exp?: string) => {
    const expMap: Record<string, string> = {
      'BEGINNER': tExp('beginner'),
      'INTERMEDIATE': tExp('intermediate'),
      'ADVANCED': tExp('advanced'),
    }
    return exp ? expMap[exp] : t('notSpecified')
  }

  const formatVolume = (vol?: string) => {
    const volMap: Record<string, string> = {
      '0_5': tVol('0_5'),
      '5_15': tVol('5_15'),
      '15_30': tVol('15_30'),
      '30_50': tVol('30_50'),
      '50_PLUS': tVol('50_plus'),
    }
    return vol ? volMap[vol] : t('notSpecified')
  }

  const formatInjuries = (injuries?: string[]) => {
    const injMap: Record<string, string> = {
      'NONE': tInj('none'),
      'KNEE': tInj('knee'),
      'SHIN': tInj('shin'),
      'FOOT': tInj('foot'),
      'OTHER': tInj('other'),
    }
    if (!injuries || injuries.length === 0) return t('notSpecified')
    return injuries.map(inj => injMap[inj] || inj).join(', ')
  }

  const formatPreferredDays = (days?: string[]): string | undefined => {
    if (!days || days.length === 0) return undefined
    const dayMap: Record<string, string> = {
      'monday': tDays('monday'),
      'tuesday': tDays('tuesday'),
      'wednesday': tDays('wednesday'),
      'thursday': tDays('thursday'),
      'friday': tDays('friday'),
      'saturday': tDays('saturday'),
      'sunday': tDays('sunday'),
    }
    return days.map(day => dayMap[day] || day).join(', ')
  }

  const formatIntensity = (intensity?: string) => {
    const intensityMap: Record<string, string> = {
      'LOW': tPref('low'),
      'MEDIUM': tPref('medium'),
      'HIGH': tPref('high'),
    }
    return intensity ? intensityMap[intensity] : t('notSpecified')
  }

  const ReviewItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="flex justify-between items-start py-3 border-b border-dark-border last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium text-right">{value || t('notSpecified')}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-semibold text-text-primary mb-6">{t('yourProfile')}</h3>
        <div className="space-y-0">
          <ReviewItem label={t('goal')} value={formatGoal(data.goal)} />
          {data.eventDate && <ReviewItem label={t('eventDate')} value={data.eventDate} />}
          {data.targetTime && <ReviewItem label={t('targetTime')} value={data.targetTime} />}
          {data.targetPace && <ReviewItem label={t('targetPace')} value={`${data.targetPace}/km`} />}
          <ReviewItem label={t('experienceLevel')} value={formatExperience(data.experienceLevel)} />
          {data.canRun20MinsContinuously !== undefined && (
            <ReviewItem
              label={t('canRun20Mins')}
              value={data.canRun20MinsContinuously ? tCommon('yes') : tCommon('no')}
            />
          )}
          {data.recentBest5K && <ReviewItem label={t('recent5kTime')} value={data.recentBest5K} />}
          {data.recentBest10K && <ReviewItem label={t('recent10kTime')} value={data.recentBest10K} />}
          {data.recentEasyPace && <ReviewItem label={t('easyPace')} value={`${data.recentEasyPace}/km`} />}
          <ReviewItem label={t('weeklyVolume')} value={formatVolume(data.weeklyVolume)} />
          <ReviewItem label={t('trainingDaysWeek')} value={data.daysPerWeek?.toString()} />
          {data.preferredDays && data.preferredDays.length > 0 && (
            <ReviewItem label={t('preferredDays')} value={formatPreferredDays(data.preferredDays)} />
          )}
          <ReviewItem label={t('longestRecentRun')} value={data.noRecentRun ? t('noRecentRun') : data.longestRecentRun ? `${data.longestRecentRun} km` : undefined} />
          <ReviewItem label={t('injuries')} value={formatInjuries(data.injuryTypes)} />
          {data.injuryDetails && <ReviewItem label={t('injuryDetails')} value={data.injuryDetails} />}
          {data.equipment && data.equipment.length > 0 && (
            <ReviewItem label={t('equipment')} value={data.equipment.join(', ')} />
          )}
          {data.planStyle && (
            <ReviewItem
              label={t('planStyle')}
              value={data.planStyle === 'TIME_BASED' ? tPref('timeBased') : tPref('distanceBased')}
            />
          )}
          {data.planFlexibility && (
            <ReviewItem
              label={t('flexibility')}
              value={data.planFlexibility === 'STRUCTURED' ? tPref('structured') : tPref('flexible')}
            />
          )}
          {data.intensityTolerance && (
            <ReviewItem label={t('intensity')} value={formatIntensity(data.intensityTolerance)} />
          )}
        </div>
      </Card>

      <p className="text-sm text-text-muted text-center">
        {t('hint')}
      </p>
    </div>
  )
}

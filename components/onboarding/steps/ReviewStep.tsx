'use client'

import { useOnboarding } from '@/lib/onboarding/context'
import Card from '@/components/ui/Card'

export default function ReviewStep() {
  const { data } = useOnboarding()

  const formatGoal = (goal?: string) => {
    const goalMap: Record<string, string> = {
      '5K': '5K Race',
      '10K': '10K Race',
      'HALF_MARATHON': 'Half Marathon',
      'MARATHON': 'Marathon',
      'GENERAL_FITNESS': 'General Fitness',
    }
    return goal ? goalMap[goal] : 'Not specified'
  }

  const formatExperience = (exp?: string) => {
    const expMap: Record<string, string> = {
      'BEGINNER': 'Beginner',
      'INTERMEDIATE': 'Intermediate',
      'ADVANCED': 'Advanced',
    }
    return exp ? expMap[exp] : 'Not specified'
  }

  const formatVolume = (vol?: string) => {
    const volMap: Record<string, string> = {
      '0_5': '0-5 km',
      '5_15': '5-15 km',
      '15_30': '15-30 km',
      '30_50': '30-50 km',
      '50_PLUS': '50+ km',
    }
    return vol ? volMap[vol] : 'Not specified'
  }

  const formatInjuries = (injuries?: string[]) => {
    const injMap: Record<string, string> = {
      'NONE': 'No injuries',
      'KNEE': 'Knee issues',
      'SHIN': 'Shin splints',
      'FOOT': 'Foot problems',
      'OTHER': 'Other',
    }
    if (!injuries || injuries.length === 0) return 'Not specified'
    return injuries.map(inj => injMap[inj] || inj).join(', ')
  }

  const ReviewItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="flex justify-between items-start py-3 border-b border-dark-border last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium text-right">{value || 'Not specified'}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-semibold text-text-primary mb-6">Your Profile</h3>
        <div className="space-y-0">
          <ReviewItem label="Goal" value={formatGoal(data.goal)} />
          {data.eventDate && <ReviewItem label="Event Date" value={data.eventDate} />}
          {data.targetTime && <ReviewItem label="Target Time" value={data.targetTime} />}
          {data.targetPace && <ReviewItem label="Target Pace" value={`${data.targetPace}/km`} />}
          <ReviewItem label="Experience Level" value={formatExperience(data.experienceLevel)} />
          {data.canRun20MinsContinuously !== undefined && (
            <ReviewItem
              label="Can run 20 mins continuously"
              value={data.canRun20MinsContinuously ? 'Yes' : 'No'}
            />
          )}
          {data.recentBest5K && <ReviewItem label="Recent 5K Time" value={data.recentBest5K} />}
          {data.recentBest10K && <ReviewItem label="Recent 10K Time" value={data.recentBest10K} />}
          {data.recentEasyPace && <ReviewItem label="Easy Pace" value={`${data.recentEasyPace}/km`} />}
          <ReviewItem label="Weekly Volume" value={formatVolume(data.weeklyVolume)} />
          <ReviewItem label="Training Days/Week" value={data.daysPerWeek?.toString()} />
          {data.preferredDays && data.preferredDays.length > 0 && (
            <ReviewItem label="Preferred Days" value={data.preferredDays.join(', ')} />
          )}
          <ReviewItem label="Longest Recent Run" value={data.noRecentRun ? 'No recent run' : data.longestRecentRun ? `${data.longestRecentRun} km` : undefined} />
          <ReviewItem label="Injuries" value={formatInjuries(data.injuryTypes)} />
          {data.injuryDetails && <ReviewItem label="Injury Details" value={data.injuryDetails} />}
          {data.equipment && data.equipment.length > 0 && (
            <ReviewItem label="Equipment" value={data.equipment.join(', ')} />
          )}
          {data.planStyle && (
            <ReviewItem
              label="Plan Style"
              value={data.planStyle === 'TIME_BASED' ? 'Time-based' : 'Distance-based'}
            />
          )}
          {data.planFlexibility && (
            <ReviewItem
              label="Flexibility"
              value={data.planFlexibility === 'STRUCTURED' ? 'Structured' : 'Flexible'}
            />
          )}
          {data.intensityTolerance && (
            <ReviewItem label="Intensity" value={data.intensityTolerance} />
          )}
        </div>
      </Card>

      <p className="text-sm text-text-muted text-center">
        Review your information above. You can go back to make changes or continue to generate your personalized training plan.
      </p>
    </div>
  )
}

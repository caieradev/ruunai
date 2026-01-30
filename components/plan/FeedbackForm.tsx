'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import RadioGroup from '@/components/ui/RadioGroup'
import Button from '@/components/ui/Button'
import type {
  PlanFeedback,
  FeedbackDifficulty,
  FeedbackVolume,
  FeedbackVariety,
  FeedbackInjuries,
} from '@/lib/supabase/types'

interface FeedbackFormProps {
  onSubmit: (feedback: PlanFeedback) => void
}

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const t = useTranslations('plan.feedback')

  const [difficulty, setDifficulty] = useState<FeedbackDifficulty | ''>('')
  const [volume, setVolume] = useState<FeedbackVolume | ''>('')
  const [variety, setVariety] = useState<FeedbackVariety | ''>('')
  const [injuries, setInjuries] = useState<FeedbackInjuries | ''>('')
  const [comments, setComments] = useState('')

  const difficultyOptions = [
    { value: 'TOO_EASY', label: t('difficulty.TOO_EASY') },
    { value: 'ADEQUATE', label: t('difficulty.ADEQUATE') },
    { value: 'TOO_HARD', label: t('difficulty.TOO_HARD') },
  ]

  const volumeOptions = [
    { value: 'WANTED_MORE', label: t('volume.WANTED_MORE') },
    { value: 'GOOD', label: t('volume.GOOD') },
    { value: 'TOO_MUCH', label: t('volume.TOO_MUCH') },
  ]

  const varietyOptions = [
    { value: 'WANTED_MORE', label: t('variety.WANTED_MORE') },
    { value: 'GOOD', label: t('variety.GOOD') },
    { value: 'TOO_MUCH', label: t('variety.TOO_MUCH') },
  ]

  const injuriesOptions = [
    { value: 'NO_ISSUES', label: t('injuries.NO_ISSUES') },
    { value: 'HAD_DISCOMFORT', label: t('injuries.HAD_DISCOMFORT') },
    { value: 'GOT_INJURED', label: t('injuries.GOT_INJURED') },
  ]

  const isValid = difficulty && volume && variety && injuries

  const handleSubmit = () => {
    if (!isValid) return

    const feedback: PlanFeedback = {
      difficulty: difficulty as FeedbackDifficulty,
      volume: volume as FeedbackVolume,
      variety: variety as FeedbackVariety,
      injuries: injuries as FeedbackInjuries,
      ...(comments.trim() && { comments: comments.trim() }),
    }

    onSubmit(feedback)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">
        {t('title')}
      </h3>

      <div className="space-y-6 divide-y divide-dark-border">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-secondary">
            {t('difficulty.label')}
          </label>
          <RadioGroup
            options={difficultyOptions}
            value={difficulty}
            onChange={(value) => setDifficulty(value as FeedbackDifficulty)}
            name="feedback-difficulty"
          />
        </div>

        <div className="space-y-3 pt-6">
          <label className="block text-sm font-medium text-text-secondary">
            {t('volume.label')}
          </label>
          <RadioGroup
            options={volumeOptions}
            value={volume}
            onChange={(value) => setVolume(value as FeedbackVolume)}
            name="feedback-volume"
          />
        </div>

        <div className="space-y-3 pt-6">
          <label className="block text-sm font-medium text-text-secondary">
            {t('variety.label')}
          </label>
          <RadioGroup
            options={varietyOptions}
            value={variety}
            onChange={(value) => setVariety(value as FeedbackVariety)}
            name="feedback-variety"
          />
        </div>

        <div className="space-y-3 pt-6">
          <label className="block text-sm font-medium text-text-secondary">
            {t('injuries.label')}
          </label>
          <RadioGroup
            options={injuriesOptions}
            value={injuries}
            onChange={(value) => setInjuries(value as FeedbackInjuries)}
            name="feedback-injuries"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">
          {t('comments.label')}
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder={t('comments.placeholder')}
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors resize-none"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full"
      >
        {t('submit')}
      </Button>
    </div>
  )
}

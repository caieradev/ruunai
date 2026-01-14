'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'

const STAGES = [
  { label: 'Analyzing your profile...', duration: 1150 },
  { label: 'Calculating training zones...', duration: 1150 },
  { label: 'Building weekly structure...', duration: 1150 },
  { label: 'Optimizing workout intensity...', duration: 1150 },
  { label: 'Scheduling recovery days...', duration: 1150 },
  { label: 'Balancing workload distribution...', duration: 1150 },
  { label: 'Adding progression milestones...', duration: 1150 },
  { label: 'Finalizing your plan...', duration: 1450 }, // + 500ms pause handled in logic
]

const TOTAL_DURATION = STAGES.reduce((sum, s) => sum + s.duration, 0)

interface PlanGeneratingLoaderProps {
  onComplete: () => void
}

export default function PlanGeneratingLoader({ onComplete }: PlanGeneratingLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let elapsed = 0
    let lastTime = performance.now()
    let animationFrame: number
    let completionTimeout: NodeJS.Timeout | null = null

    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime
      lastTime = currentTime
      elapsed += delta
      setProgress((elapsed / TOTAL_DURATION) * 100)

      // Calculate current stage
      let accumulated = 0
      for (let i = 0; i < STAGES.length; i++) {
        accumulated += STAGES[i].duration
        if (elapsed < accumulated) {
          setCurrentStage(i)
          break
        }
      }

      if (elapsed >= TOTAL_DURATION) {
        setCurrentStage(STAGES.length - 1)
        setProgress(100)
        // Pause 500ms on the last step before completing
        completionTimeout = setTimeout(() => {
          onComplete()
        }, 500)
        return
      }

      animationFrame = requestAnimationFrame(animate)
    }

    // Start with a small delay for smooth entry
    const timeout = setTimeout(() => {
      lastTime = performance.now()
      animationFrame = requestAnimationFrame(animate)
    }, 100)

    return () => {
      clearTimeout(timeout)
      if (completionTimeout) clearTimeout(completionTimeout)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [onComplete])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md text-center animate-fade-in">
        <div className="mb-8">
          {/* Animated running pulse */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-primary/20 flex items-center justify-center relative">
            <span className="text-4xl">🏃</span>
            <div className="absolute inset-0 rounded-full border-2 border-accent-primary/30 animate-ping" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
            Creating Your Plan
          </h2>
          <p className="text-text-secondary h-6">{STAGES[currentStage]?.label}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-dark-border rounded-full mb-4">
          <div
            className="h-full bg-accent-primary rounded-full"
            style={{
              width: `${Math.min(progress, 100)}%`,
              willChange: 'width',
            }}
          />
        </div>

        <p className="text-sm text-text-muted">
          Step {currentStage + 1} of {STAGES.length}
        </p>
      </Card>
    </div>
  )
}

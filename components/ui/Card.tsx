import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  bordered?: boolean
}

export default function Card({ children, className, hoverable = false, bordered = true }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-dark-surface p-6 sm:p-8',
        bordered && 'border border-dark-border',
        hoverable && 'transition-transform duration-200 hover:scale-[1.02]',
        className
      )}
    >
      {children}
    </div>
  )
}

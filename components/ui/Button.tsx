import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const variantMap = {
  primary:
    'bg-accent-primary text-dark-bg hover:bg-accent-hover active:scale-95 font-semibold shadow-lg shadow-accent-primary/20',
  secondary:
    'bg-dark-surface text-text-primary hover:bg-dark-border active:scale-95 border border-dark-border',
  outline:
    'border-2 border-accent-primary text-accent-primary hover:bg-accent-primary/10 active:scale-95',
}

const sizeMap = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

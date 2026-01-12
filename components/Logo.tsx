import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { height: 32 },
  md: { height: 48 },
  lg: { height: 64 },
}

export default function Logo({ variant = 'light', size = 'md', className }: LogoProps) {
  const { height } = sizeMap[size]

  return (
    <div className={cn('flex items-center', className)} style={{ height: `${height}px` }}>
      <svg
        width="auto"
        height={height}
        viewBox="0 0 120 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <text
          x="0"
          y="36"
          fontFamily="var(--font-space-grotesk), system-ui, sans-serif"
          fontSize="36"
          fontWeight="800"
          letterSpacing="-0.02em"
        >
          <tspan fill="#FFFFFF">Ruun</tspan>
          <tspan fill="#00E5A0">AI</tspan>
        </text>
      </svg>
    </div>
  )
}

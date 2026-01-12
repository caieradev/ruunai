import Link from 'next/link'
import Logo from './Logo'

interface HeaderProps {
  showLogin?: boolean
}

export default function Header({ showLogin = true }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="focus-ring rounded-lg">
            <Logo size="sm" />
          </Link>

          {showLogin && (
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-accent-primary transition-colors focus-ring rounded px-3 py-2"
            >
              Already have an account? Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

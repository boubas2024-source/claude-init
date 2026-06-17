import { clsx } from 'clsx'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Loader({ size = 'md', className }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  }

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-navy border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader size="lg" className="mx-auto mb-4" />
        <p className="text-gray-500">Chargement...</p>
      </div>
    </div>
  )
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader size="md" />
    </div>
  )
}

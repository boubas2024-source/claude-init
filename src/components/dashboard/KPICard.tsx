import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { clsx } from 'clsx'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: number
  color?: 'navy' | 'rust' | 'gold' | 'green'
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'navy',
}: KPICardProps) {
  const colorClasses = {
    navy: {
      bg: 'bg-navy',
      text: 'text-navy',
      light: 'bg-navy/10',
    },
    rust: {
      bg: 'bg-rust',
      text: 'text-rust',
      light: 'bg-rust/10',
    },
    gold: {
      bg: 'bg-gold',
      text: 'text-gold-600',
      light: 'bg-gold/10',
    },
    green: {
      bg: 'bg-green-600',
      text: 'text-green-600',
      light: 'bg-green-50',
    },
  }

  const colors = colorClasses[color]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={clsx('text-3xl font-bold', colors.text)}>{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={clsx('rounded-xl p-3', colors.light)}>
          <Icon className={clsx('h-6 w-6', colors.text)} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          {trend > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : trend < 0 ? (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          ) : (
            <Minus className="h-4 w-4 text-gray-400 mr-1" />
          )}
          <span
            className={clsx(
              'text-sm font-medium',
              trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'
            )}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-sm text-gray-400 ml-1">vs mois dernier</span>
        </div>
      )}
    </div>
  )
}

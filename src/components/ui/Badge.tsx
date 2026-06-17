import { clsx } from 'clsx'

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'navy'
  | 'gold'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  navy: 'bg-navy-100 text-navy',
  gold: 'bg-gold-50 text-gold-600',
}

export function Badge({ variant = 'default', children, className, size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// Specific status badges
export function StatutSouscriptionBadge({ statut }: { statut: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    EN_ATTENTE: { variant: 'warning', label: 'En attente' },
    VALIDEE: { variant: 'success', label: 'Validée' },
    EXPIREE: { variant: 'danger', label: 'Expirée' },
    ANNULEE: { variant: 'default', label: 'Annulée' },
  }
  const { variant, label } = config[statut] || { variant: 'default', label: statut }
  return <Badge variant={variant}>{label}</Badge>
}

export function StatutProduitBadge({ statut }: { statut: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    DISPONIBLE: { variant: 'success', label: 'Disponible' },
    RESERVE: { variant: 'warning', label: 'Réservé' },
    VENDU: { variant: 'danger', label: 'Vendu' },
  }
  const { variant, label } = config[statut] || { variant: 'default', label: statut }
  return <Badge variant={variant}>{label}</Badge>
}

export function CategorieBadge({ categorie }: { categorie: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    DJIGUI: { variant: 'info', label: 'DJIGUI (UHP)' },
    DJIGUIYA: { variant: 'navy', label: 'DJIGUIYA (F3/F4)' },
    HAKILI: { variant: 'gold', label: 'HAKILI (Villa)' },
    HAKILI_SIGUI: { variant: 'danger', label: 'HAKILI SIGUI (Prestige)' },
  }
  const { variant, label } = config[categorie] || { variant: 'default', label: categorie }
  return <Badge variant={variant}>{label}</Badge>
}

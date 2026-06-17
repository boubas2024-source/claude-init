import Link from 'next/link'
import { MapPin, Maximize2, Home, ArrowRight } from 'lucide-react'
import { CategorieBadge, StatutProduitBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface ProductCardProps {
  id: string
  reference: string
  categorie: string
  surface: number
  nbPieces: number
  prixTotal: number
  fraisSouscription: number
  programme: {
    nom: string
    ville: string
  }
  statut: string
  localisation?: string
  stockDisponible: number
}

export function ProductCard({
  id,
  reference,
  categorie,
  surface,
  nbPieces,
  prixTotal,
  fraisSouscription,
  programme,
  statut,
  localisation,
  stockDisponible,
}: ProductCardProps) {
  const isAvailable = statut === 'DISPONIBLE' && stockDisponible > 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-navy-100 to-navy-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Home className="h-16 w-16 text-navy-300" />
        </div>
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <CategorieBadge categorie={categorie} />
        </div>
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <StatutProduitBadge statut={statut} />
        </div>
        {/* Stock indicator */}
        {stockDisponible > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/50 rounded px-2 py-1">
            <span className="text-white text-xs">{stockDisponible} disponible{stockDisponible > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-mono text-gray-500">{reference}</p>
            <h3 className="text-navy font-semibold text-lg group-hover:text-rust transition-colors">
              {programme.nom}
            </h3>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{localisation || programme.ville}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Maximize2 className="h-4 w-4 mr-1 text-navy" />
            <span>{surface} m²</span>
          </div>
          <div className="flex items-center">
            <Home className="h-4 w-4 mr-1 text-navy" />
            <span>{nbPieces} pièce{nbPieces > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Prix total</p>
              <p className="text-navy font-bold text-lg">
                {prixTotal.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Frais souscription</p>
              <p className="text-rust font-semibold text-sm">
                {fraisSouscription.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/programmes/${id}`} className="flex-1">
            <Button variant="outline" size="sm" fullWidth>
              Détails
            </Button>
          </Link>
          {isAvailable && (
            <Link href={`/souscrire/${id}`} className="flex-1">
              <Button variant="primary" size="sm" fullWidth>
                Souscrire
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

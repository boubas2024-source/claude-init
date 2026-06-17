import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { CategorieBadge, StatutProduitBadge } from '@/components/ui/Badge'
import {
  MapPin,
  Maximize2,
  Home,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Package,
} from 'lucide-react'

interface ProductDetailPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: { programme: true },
  })
  if (!produit) return { title: 'Produit introuvable | IMAZ' }
  return {
    title: `${produit.reference} — ${produit.programme.nom} | IMAZ`,
    description: produit.description || `Logement ${produit.categorie} - ${produit.surface}m²`,
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: {
      programme: true,
    },
  })

  if (!produit) notFound()

  const isAvailable = produit.statut === 'DISPONIBLE' && produit.stockDisponible > 0

  const categorieDescriptions: Record<string, string> = {
    DJIGUI: "Unité d'Habitation Populaire — Logement abordable de qualité, idéal pour les ménages à revenu modeste.",
    DJIGUIYA: "Appartement F3/F4 — Spacieux appartement 3 ou 4 pièces, conçu pour le confort familial.",
    HAKILI: "Villa Standard R+1 — Villa individuelle sur 2 niveaux avec jardin, alliant confort et espace.",
    HAKILI_SIGUI: "Villa Prestige Haut de Gamme — Le summum du logement résidentiel burkinabè, finitions premium.",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/programmes" className="hover:text-navy transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Catalogue
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{produit.reference}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images and details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-gradient-to-br from-navy-100 to-navy-200 rounded-2xl h-72 flex items-center justify-center relative overflow-hidden">
              <Building2 className="h-24 w-24 text-navy-300" />
              <div className="absolute top-4 left-4">
                <CategorieBadge categorie={produit.categorie} />
              </div>
              <div className="absolute top-4 right-4">
                <StatutProduitBadge statut={produit.statut} />
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-mono text-gray-400 mb-1">{produit.reference}</p>
                  <h1 className="text-2xl font-bold text-navy">{produit.programme.nom}</h1>
                </div>
              </div>

              <div className="flex items-center text-gray-500 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{produit.localisation || produit.programme.ville}</span>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Maximize2 className="h-5 w-5 text-navy mx-auto mb-1" />
                  <p className="text-lg font-bold text-navy">{produit.surface}</p>
                  <p className="text-xs text-gray-500">m²</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Home className="h-5 w-5 text-navy mx-auto mb-1" />
                  <p className="text-lg font-bold text-navy">{produit.nbPieces}</p>
                  <p className="text-xs text-gray-500">pièces</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Building2 className="h-5 w-5 text-navy mx-auto mb-1" />
                  <p className="text-lg font-bold text-navy">R+{produit.niveaux - 1}</p>
                  <p className="text-xs text-gray-500">niveaux</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Package className="h-5 w-5 text-navy mx-auto mb-1" />
                  <p className="text-lg font-bold text-navy">{produit.stockDisponible}</p>
                  <p className="text-xs text-gray-500">disponibles</p>
                </div>
              </div>

              {/* Category description */}
              <div className="p-4 bg-navy/5 rounded-xl border border-navy/10 mb-4">
                <p className="text-sm text-navy font-medium mb-1">{produit.categorie}</p>
                <p className="text-sm text-gray-600">
                  {categorieDescriptions[produit.categorie]}
                </p>
              </div>

              {/* Description */}
              {produit.description && (
                <div>
                  <h3 className="font-semibold text-navy mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{produit.description}</p>
                </div>
              )}
            </div>

            {/* Programme info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-navy mb-4">À propos du programme</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Programme</p>
                  <p className="font-medium text-gray-800">{produit.programme.nom}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Ville</p>
                  <p className="font-medium text-gray-800">{produit.programme.ville}</p>
                </div>
                {produit.programme.secteur && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Secteur</p>
                    <p className="font-medium text-gray-800">{produit.programme.secteur}</p>
                  </div>
                )}
                {produit.programme.dateOuverture && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-400">Ouverture</p>
                    </div>
                    <p className="font-medium text-gray-800">
                      {new Date(produit.programme.dateOuverture).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
              {produit.programme.description && (
                <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                  {produit.programme.description}
                </p>
              )}
            </div>
          </div>

          {/* Right column - CTA card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Prix total du bien</p>
                <p className="text-3xl font-bold text-navy">
                  {produit.prixTotal.toLocaleString('fr-FR')}
                  <span className="text-lg ml-1">FCFA</span>
                </p>
              </div>

              <div className="p-4 bg-rust/5 rounded-xl border border-rust/20 mb-6">
                <p className="text-sm text-gray-600 mb-1">Frais de souscription</p>
                <p className="text-2xl font-bold text-rust">
                  {produit.fraisSouscription.toLocaleString('fr-FR')}
                  <span className="text-base ml-1">FCFA</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">À payer en agence IMAZ</p>
              </div>

              <div className="p-3 bg-gold/10 rounded-lg border border-gold/20 mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Validité dossier :</span>{' '}
                  {produit.delaiValiditeJours} jours après souscription
                </p>
              </div>

              {isAvailable ? (
                <Link href={`/souscrire/${produit.id}`}>
                  <Button variant="primary" size="lg" fullWidth>
                    Souscrire maintenant
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" size="lg" fullWidth disabled>
                  {produit.statut === 'VENDU' ? 'Vendu' : 'Non disponible'}
                </Button>
              )}

              <p className="text-xs text-gray-400 text-center mt-4">
                La souscription est gratuite. Le paiement s&apos;effectue uniquement en agence.
              </p>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-navy mb-3">Contact agence</h4>
                <p className="text-sm text-gray-500">📞 +226 XX XX XX XX</p>
                <p className="text-sm text-gray-500">✉️ contact@imaz.bf</p>
                <p className="text-sm text-gray-400 mt-2 text-xs">
                  Lun-Ven 8h-17h | Sam 8h-12h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

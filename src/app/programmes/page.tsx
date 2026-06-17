'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/catalogue/ProductCard'
import { FilterBar } from '@/components/catalogue/FilterBar'
import { SectionLoader } from '@/components/ui/Loader'
import { Building2, WifiOff } from 'lucide-react'
import { catalogueCache } from '@/lib/catalogueCache'

interface Programme {
  id: string
  nom: string
}

interface Produit {
  id: string
  reference: string
  categorie: string
  surface: number
  nbPieces: number
  prixTotal: number
  fraisSouscription: number
  statut: string
  localisation: string | null
  stockDisponible: number
  programme: {
    id: string
    nom: string
    ville: string
  }
}

export default function ProgrammesPage() {
  const [produits, setProduits]     = useState<Produit[]>([])
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [isOffline, setIsOffline]   = useState(false)

  // Filters
  const [search, setSearch]       = useState('')
  const [categorie, setCategorie] = useState('')
  const [programme, setProgramme] = useState('')
  const [statut, setStatut]       = useState('')

  useEffect(() => {
    const fetchData = async () => {
      // 1. Afficher immédiatement depuis le cache IndexedDB si disponible
      const [cachedProduits, cachedProgrammes] = await Promise.all([
        catalogueCache.getProduits<Produit>(),
        catalogueCache.getProgrammes<Programme>(),
      ])
      if (cachedProduits && cachedProgrammes) {
        setProduits(cachedProduits)
        setProgrammes(cachedProgrammes)
        setIsLoading(false)
      }

      // 2. Tenter la mise à jour réseau
      try {
        const [produitsRes, programmesRes] = await Promise.all([
          fetch('/api/produits'),
          fetch('/api/programmes'),
        ])
        const [produitsData, programmesData] = await Promise.all([
          produitsRes.json(),
          programmesRes.json(),
        ])
        const freshProduits   = produitsData.produits   || []
        const freshProgrammes = programmesData.programmes || []

        setProduits(freshProduits)
        setProgrammes(freshProgrammes)
        setIsOffline(false)

        // Mettre à jour le cache en arrière-plan
        await Promise.all([
          catalogueCache.cacheProduits(freshProduits),
          catalogueCache.cacheProgrammes(freshProgrammes),
        ])
      } catch {
        // Réseau indisponible — on reste sur le cache
        if (!cachedProduits) {
          setIsOffline(true)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = produits.filter((p) => {
    if (search && !p.reference.toLowerCase().includes(search.toLowerCase()) &&
        !p.programme.nom.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (categorie && p.categorie !== categorie) return false
    if (programme && p.programme.id !== programme) return false
    if (statut && p.statut !== statut) return false
    return true
  })

  const handleReset = () => {
    setSearch('')
    setCategorie('')
    setProgramme('')
    setStatut('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Bannière mode hors-ligne */}
      {isOffline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-800 text-sm">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>Mode hors-ligne — données du dernier cache affiché. Reconnectez-vous pour voir les disponibilités en temps réel.</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-gold" />
            <h1 className="text-3xl font-bold text-white">Catalogue de Logements</h1>
          </div>
          <p className="text-navy-200">
            Découvrez nos programmes immobiliers disponibles au Burkina Faso
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            categorie={categorie}
            onCategorieChange={setCategorie}
            programme={programme}
            onProgrammeChange={setProgramme}
            statut={statut}
            onStatutChange={setStatut}
            programmes={programmes}
            onReset={handleReset}
          />
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-gray-500 text-sm mb-6">
            {filtered.length} logement{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Products grid */}
        {isLoading ? (
          <SectionLoader />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucun logement trouvé</h3>
            <p className="text-gray-400">
              Modifiez vos filtres ou{' '}
              <button onClick={handleReset} className="text-navy underline">
                réinitialisez la recherche
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((produit) => (
              <ProductCard
                key={produit.id}
                id={produit.id}
                reference={produit.reference}
                categorie={produit.categorie}
                surface={produit.surface}
                nbPieces={produit.nbPieces}
                prixTotal={produit.prixTotal}
                fraisSouscription={produit.fraisSouscription}
                programme={produit.programme}
                statut={produit.statut}
                localisation={produit.localisation || undefined}
                stockDisponible={produit.stockDisponible}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

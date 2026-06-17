'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SubscriberTable } from '@/components/backoffice/SubscriberTable'
import { Button } from '@/components/ui/Button'
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface Programme { id: string; nom: string }

interface Souscription {
  id: string
  numRecu: string
  dateCreation: string
  statut: string
  dateExpiration: string
  client: { nom: string; prenom: string; telephone: string; email: string }
  produit: { reference: string; categorie: string; fraisSouscription: number }
  programme: { nom: string }
}

interface Props {
  souscriptions: Souscription[]
  total: number
  page: number
  perPage: number
  programmes: Programme[]
}

export function SouscripteursClient({ souscriptions, total, page, perPage, programmes }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('')
  const [programme, setProgramme] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const totalPages = Math.ceil(total / perPage)

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statut) params.set('statut', statut)
    if (programme) params.set('programme', programme)
    params.set('page', '1')
    router.push(`/backoffice/souscripteurs?${params.toString()}`)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/backoffice/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'souscriptions' }),
      })
      if (!response.ok) throw new Error('Erreur export')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `souscriptions-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export réussi')
    } catch {
      toast.error('Erreur lors de l\'export')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy">Souscripteurs</h2>
          <p className="text-gray-500">{total} dossier{total !== 1 ? 's' : ''} au total</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} isLoading={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          Exporter Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="N° dossier, nom, téléphone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy bg-white"
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="VALIDEE">Validée</option>
            <option value="EXPIREE">Expirée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
          <select
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy bg-white"
          >
            <option value="">Tous les programmes</option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end mt-3">
          <Button variant="primary" size="sm" onClick={applyFilters}>
            Appliquer
          </Button>
        </div>
      </div>

      <SubscriberTable souscriptions={souscriptions} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Page {page} sur {totalPages} ({total} résultats)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/backoffice/souscripteurs?page=${page - 1}`)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/backoffice/souscripteurs?page=${page + 1}`)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { BackofficeLayout } from '@/components/layout/BackofficeLayout'
import { PaymentModal } from '@/components/backoffice/PaymentModal'
import { StatutSouscriptionBadge, CategorieBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Search, CreditCard, User, Calendar, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SouscriptionFound {
  id: string
  numRecu: string
  statut: string
  dateCreation: string
  dateExpiration: string
  client: {
    nom: string
    prenom: string
    telephone: string
    email: string
  }
  produit: {
    reference: string
    categorie: string
    fraisSouscription: number
    surface: number
    nbPieces: number
  }
  programme: {
    nom: string
    ville: string
  }
  paiements: Array<{
    id: string
    montant: number
    modeReglement: string
    dateValidation: string
  }>
}

export default function GuichetPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<SouscriptionFound | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setResult(null)
    try {
      const response = await fetch(
        `/api/backoffice/souscripteurs/search?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Dossier introuvable')
      setResult(data.souscription)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Dossier introuvable')
    } finally {
      setIsSearching(false)
    }
  }

  const totalPaid = result?.paiements.reduce((sum, p) => sum + p.montant, 0) || 0
  const isPaid = result && totalPaid >= result.produit.fraisSouscription
  const isExpired = result && new Date(result.dateExpiration) < new Date()
  const canPay = result && result.statut === 'EN_ATTENTE' && !isExpired && !isPaid

  return (
    <BackofficeLayout>
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy mb-2">Guichet — Validation des paiements</h2>
          <p className="text-gray-500">
            Recherchez un dossier par numéro, nom ou téléphone pour valider le paiement
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rechercher un dossier
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="N° dossier (ex: IMA-20240101-001), nom ou téléphone..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-base"
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSearch}
              isLoading={isSearching}
            >
              <Search className="h-5 w-5 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-navy px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-navy-200 text-sm">N° Dossier</p>
                <p className="text-white font-mono text-2xl font-bold">{result.numRecu}</p>
              </div>
              <div className="text-right">
                <StatutSouscriptionBadge statut={result.statut} />
                {isPaid && (
                  <span className="ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                    Payé
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Alerts */}
              {isExpired && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-700 font-medium">Ce dossier est expiré</p>
                </div>
              )}
              {isPaid && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                  <AlertCircle className="h-5 w-5 text-green-500" />
                  <p className="text-green-700 font-medium">Ce dossier a déjà été payé</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client info */}
                <div>
                  <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" /> Client
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">Nom complet</p>
                      <p className="font-medium">
                        {result.client.prenom} {result.client.nom}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Téléphone</p>
                      <p className="font-medium">{result.client.telephone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="font-medium">{result.client.email}</p>
                    </div>
                  </div>
                </div>

                {/* Product info */}
                <div>
                  <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Bien
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">Programme</p>
                      <p className="font-medium">{result.programme.nom}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Référence</p>
                      <p className="font-mono font-medium">{result.produit.reference}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Catégorie</p>
                      <CategorieBadge categorie={result.produit.categorie} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{result.produit.surface} m² — {result.produit.nbPieces} pièces</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates and amounts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date souscription
                  </p>
                  <p className="font-medium">
                    {format(new Date(result.dateCreation), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Expire le</p>
                  <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                    {format(new Date(result.dateExpiration), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="bg-rust/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Frais à payer</p>
                  <p className="text-xl font-bold text-rust">
                    {result.produit.fraisSouscription.toLocaleString('fr-FR')} FCFA
                  </p>
                  {totalPaid > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Déjà payé: {totalPaid.toLocaleString('fr-FR')} FCFA
                    </p>
                  )}
                </div>
              </div>

              {/* Payment history */}
              {result.paiements.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="font-semibold text-navy mb-3">Historique des paiements</h4>
                  <div className="space-y-2">
                    {result.paiements.map((p) => (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{p.modeReglement}</p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(p.dateValidation), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </p>
                        </div>
                        <p className="font-bold text-green-700">
                          {p.montant.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action */}
              {canPay && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Valider le paiement
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment modal */}
        {result && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            souscription={{
              id: result.id,
              numRecu: result.numRecu,
              client: result.client,
              produit: result.produit,
              programme: result.programme,
            }}
            onSuccess={() => {
              setIsPaymentModalOpen(false)
              // Refresh search
              handleSearch()
            }}
          />
        )}
      </div>
    </BackofficeLayout>
  )
}

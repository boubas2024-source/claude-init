'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StepIndicator } from '@/components/souscription/StepIndicator'
import { Button } from '@/components/ui/Button'
import { CategorieBadge } from '@/components/ui/Badge'
import { SectionLoader } from '@/components/ui/Loader'
import {
  CheckCircle,
  Download,
  Home,
  MapPin,
  Maximize2,
  AlertTriangle,
  Building2,
  FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { souscriptionDraft } from '@/lib/souscriptionDraft'
import { catalogueCache } from '@/lib/catalogueCache'

const STEPS = [
  { number: 1, label: 'Bien choisi' },
  { number: 2, label: 'Vos données' },
  { number: 3, label: 'Récapitulatif' },
  { number: 4, label: 'Envoi dossier' },
  { number: 5, label: 'Confirmation' },
]

interface Produit {
  id: string
  reference: string
  categorie: string
  surface: number
  nbPieces: number
  niveaux: number
  prixTotal: number
  fraisSouscription: number
  statut: string
  stockDisponible: number
  delaiValiditeJours: number
  localisation: string | null
  description: string | null
  programme: { id: string; nom: string; ville: string }
}

interface Client {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string | null
  ville: string | null
  numIdentite: string | null
}

export default function SouscrirePage({ params }: { params: { produitId: string } }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [produit, setProduit] = useState<Produit | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptsCGV, setAcceptsCGV] = useState(false)
  const [resumedFromDraft, setResumedFromDraft] = useState(false)
  const [souscriptionResult, setSouscriptionResult] = useState<{
    numRecu: string
    dateExpiration: string
    id: string
  } | null>(null)

  // Sauvegarder le brouillon à chaque changement d'étape
  const saveDraft = useCallback((step: number, cgv: boolean) => {
    souscriptionDraft.save(params.produitId, { step, acceptsCGV: cgv })
  }, [params.produitId])

  useEffect(() => {
    const fetchData = async () => {
      // 1. Essayer le cache IndexedDB d'abord pour affichage immédiat
      const cached = await catalogueCache.getProduit<Produit>(params.produitId)
      if (cached) setProduit(cached)

      try {
        const [produitRes, clientRes] = await Promise.all([
          fetch(`/api/produits/${params.produitId}`),
          fetch('/api/auth/me'),
        ])

        if (!clientRes.ok) {
          router.push(`/auth/connexion?redirect=/souscrire/${params.produitId}`)
          return
        }

        const produitData = await produitRes.json()
        const clientData  = await clientRes.json()

        if (!produitRes.ok) {
          toast.error('Produit introuvable')
          router.push('/programmes')
          return
        }

        setProduit(produitData.produit)
        setClient(clientData.client)

        // 2. Reprendre le brouillon si disponible
        const draft = souscriptionDraft.load(params.produitId)
        if (draft && draft.step > 1 && draft.step < 5) {
          setCurrentStep(draft.step)
          setAcceptsCGV(draft.acceptsCGV)
          setResumedFromDraft(true)
          setTimeout(() => setResumedFromDraft(false), 4000)
        }
      } catch (error) {
        console.error(error)
        if (!cached) toast.error('Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.produitId, router])

  const handleSubmitSouscription = async () => {
    if (!acceptsCGV) {
      toast.error('Vous devez accepter les conditions générales')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/souscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produitId: params.produitId, accepteCGV: true }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la souscription')
      setSouscriptionResult(data)
      souscriptionDraft.clear(params.produitId)
      setCurrentStep(5)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadReceipt = async () => {
    if (!souscriptionResult) return
    try {
      const response = await fetch(`/api/souscriptions/${souscriptionResult.id}/receipt`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Erreur génération reçu')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recu-souscription-${souscriptionResult.numRecu}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Erreur lors du téléchargement du reçu')
    }
  }

  if (isLoading) return <SectionLoader />

  if (!produit) return null

  const isAvailable = produit.statut === 'DISPONIBLE' && produit.stockDisponible > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={!!client} />

      {/* Bannière reprise brouillon */}
      {resumedFromDraft && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2 text-blue-800 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Votre progression a été restaurée — vous reprenez là où vous vous étiez arrêté.</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy mb-1">Souscription en ligne</h1>
          <p className="text-gray-500">Programme {produit.programme.nom}</p>
        </div>

        {/* Step indicator */}
        <div className="mb-10">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>

        {/* Step 1 — Product confirmation */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-navy mb-6">Confirmation du bien sélectionné</h2>

            {!isAvailable && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Ce bien n&apos;est plus disponible</p>
                  <p className="text-sm text-red-600 mt-1">
                    Stock: {produit.stockDisponible} — Statut: {produit.statut}
                  </p>
                  <Link href="/programmes">
                    <Button variant="danger" size="sm" className="mt-3">
                      Voir d&apos;autres biens
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <CategorieBadge categorie={produit.categorie} />
                  <h3 className="text-lg font-bold text-navy mt-2">{produit.reference}</h3>
                  <p className="text-gray-500">{produit.programme.nom}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Frais souscription</p>
                  <p className="text-2xl font-bold text-rust">
                    {produit.fraisSouscription.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <Maximize2 className="h-5 w-5 text-navy mx-auto mb-1" />
                  <p className="text-sm font-bold">{produit.surface} m²</p>
                </div>
                <div className="text-center">
                  <Home className="h-5 w-5 text-navy mx-auto mb-1" />
                  <p className="text-sm font-bold">{produit.nbPieces} pièces</p>
                </div>
                <div className="text-center">
                  <MapPin className="h-5 w-5 text-navy mx-auto mb-1" />
                  <p className="text-sm font-bold">{produit.programme.ville}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gold/10 rounded-xl border border-gold/20">
              <p className="text-sm text-gray-700">
                <strong>Prix total du bien :</strong>{' '}
                <span className="text-navy font-bold">
                  {produit.prixTotal.toLocaleString('fr-FR')} FCFA
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Validité dossier : {produit.delaiValiditeJours} jours après souscription
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="primary"
                size="lg"
                onClick={() => { setCurrentStep(2); saveDraft(2, acceptsCGV) }}
                disabled={!isAvailable}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Client data verification */}
        {currentStep === 2 && client && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-navy mb-6">Vérification de vos informations</h2>

            <div className="bg-navy/5 rounded-xl p-6 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Nom complet</p>
                  <p className="font-medium">{client.prenom} {client.nom}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Téléphone</p>
                  <p className="font-medium">{client.telephone}</p>
                </div>
                {client.numIdentite && (
                  <div>
                    <p className="text-xs text-gray-400">Pièce d&apos;identité</p>
                    <p className="font-medium">{client.numIdentite}</p>
                  </div>
                )}
                {client.ville && (
                  <div>
                    <p className="text-xs text-gray-400">Ville</p>
                    <p className="font-medium">{client.ville}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Ces informations sont issues de votre profil. Si elles sont incorrectes,{' '}
                <Link href="/espace-client" className="underline font-medium">
                  mettez à jour votre profil
                </Link>.
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => { setCurrentStep(1); saveDraft(1, acceptsCGV) }}>Retour</Button>
              <Button variant="primary" onClick={() => { setCurrentStep(3); saveDraft(3, acceptsCGV) }}>Continuer</Button>
            </div>
          </div>
        )}

        {/* Step 3 — Summary + CGV */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-navy mb-6">Récapitulatif de votre souscription</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Programme</span>
                <span className="font-medium">{produit.programme.nom}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Référence</span>
                <span className="font-mono font-medium">{produit.reference}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Catégorie</span>
                <CategorieBadge categorie={produit.categorie} />
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Surface</span>
                <span className="font-medium">{produit.surface} m²</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Prix total</span>
                <span className="font-bold text-navy">
                  {produit.prixTotal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between py-3 bg-rust/5 px-3 rounded-lg">
                <span className="font-semibold text-gray-700">Frais de souscription</span>
                <span className="font-bold text-rust text-lg">
                  {produit.fraisSouscription.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {/* Payment notice */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800">Paiement en agence uniquement</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Aucun paiement n&apos;est requis en ligne. Vous devrez vous présenter dans une agence
                    IMAZ avec ce dossier pour effectuer le paiement des frais de souscription
                    dans un délai de <strong>{produit.delaiValiditeJours} jours</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* CGV */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="cgv"
                checked={acceptsCGV}
                onChange={(e) => setAcceptsCGV(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy"
              />
              <label htmlFor="cgv" className="text-sm text-gray-600 cursor-pointer">
                J&apos;accepte les{' '}
                <Link href="#" className="text-navy underline">
                  conditions générales de vente
                </Link>{' '}
                et je reconnais avoir pris connaissance des modalités de paiement en agence.
                Je comprends que cette souscription est valable{' '}
                <strong>{produit.delaiValiditeJours} jours</strong>.
              </label>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => { setCurrentStep(2); saveDraft(2, acceptsCGV) }}>Retour</Button>
              <Button
                variant="primary"
                onClick={() => { setCurrentStep(4); saveDraft(4, acceptsCGV) }}
                disabled={!acceptsCGV}
              >
                Soumettre mon dossier
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 — Submit */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy/10 mb-4">
                <FileText className="h-8 w-8 text-navy" />
              </div>
              <h2 className="text-xl font-bold text-navy">Prêt à soumettre</h2>
              <p className="text-gray-500 mt-2">
                Votre dossier de souscription sera enregistré et un numéro de dossier vous sera attribué.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
              <p className="text-sm text-gray-600">
                <strong>Après soumission :</strong>
              </p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1 list-disc list-inside">
                <li>Un reçu de souscription PDF sera généré</li>
                <li>Un email et SMS de confirmation vous seront envoyés</li>
                <li>Vous disposerez de {produit.delaiValiditeJours} jours pour payer en agence</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="ghost" onClick={() => { setCurrentStep(3); saveDraft(3, acceptsCGV) }} disabled={isSubmitting}>
                Retour
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmitSouscription}
                isLoading={isSubmitting}
              >
                Confirmer la souscription
              </Button>
            </div>
          </div>
        )}

        {/* Step 5 — Success */}
        {currentStep === 5 && souscriptionResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>

            <h2 className="text-2xl font-bold text-navy mb-2">Souscription confirmée !</h2>
            <p className="text-gray-500 mb-6">
              Votre dossier a été enregistré avec succès.
            </p>

            <div className="bg-navy/5 rounded-xl p-6 mb-6 text-left">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">N° de dossier</p>
                <p className="text-3xl font-mono font-bold text-navy">
                  {souscriptionResult.numRecu}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Programme</p>
                  <p className="font-medium">{produit.programme.nom}</p>
                </div>
                <div>
                  <p className="text-gray-400">Produit</p>
                  <p className="font-medium font-mono">{produit.reference}</p>
                </div>
                <div>
                  <p className="text-gray-400">Frais à payer</p>
                  <p className="font-bold text-rust">
                    {produit.fraisSouscription.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Valide jusqu&apos;au</p>
                  <p className="font-medium text-rust">
                    {new Date(souscriptionResult.dateExpiration).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6 text-left">
              <p className="text-sm font-semibold text-yellow-800 mb-1">Action requise</p>
              <p className="text-sm text-yellow-700">
                Rendez-vous dans une agence IMAZ avec ce numéro de dossier avant le{' '}
                <strong>
                  {new Date(souscriptionResult.dateExpiration).toLocaleDateString('fr-FR')}
                </strong>{' '}
                pour effectuer le paiement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDownloadReceipt}
              >
                <Download className="h-5 w-5 mr-2" />
                Télécharger le reçu PDF
              </Button>
              <Link href="/espace-client">
                <Button variant="primary" size="lg">
                  <Building2 className="h-5 w-5 mr-2" />
                  Mon espace client
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const paiementFormSchema = z.object({
  montant: z.number().positive('Montant requis'),
  modeReglement: z.enum(['ESPECES', 'CHEQUE', 'VIREMENT', 'ORANGE_MONEY', 'MOOV_MONEY']),
  referenceQuittance: z.string().optional(),
})

type PaiementFormData = z.infer<typeof paiementFormSchema>

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  souscription: {
    id: string
    numRecu: string
    client: { nom: string; prenom: string; telephone: string }
    produit: { reference: string; fraisSouscription: number }
    programme: { nom: string }
  }
  onSuccess: () => void
}

const modeReglementLabels: Record<string, string> = {
  ESPECES: 'Espèces',
  CHEQUE: 'Chèque',
  VIREMENT: 'Virement bancaire',
  ORANGE_MONEY: 'Orange Money',
  MOOV_MONEY: 'Moov Money',
}

export function PaymentModal({ isOpen, onClose, souscription, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')
  const [formData, setFormData] = useState<PaiementFormData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaiementFormData>({
    resolver: zodResolver(paiementFormSchema),
    defaultValues: {
      montant: souscription.produit.fraisSouscription,
      modeReglement: 'ESPECES',
    },
  })

  const onSubmitForm = (data: PaiementFormData) => {
    setFormData(data)
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!formData) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/backoffice/paiements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          souscriptionId: souscription.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la validation')
      }

      setStep('success')
      toast.success('Paiement validé avec succès')
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue')
      setStep('form')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('form')
    setFormData(null)
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'success' ? undefined : 'Valider un paiement'}
      size="md"
    >
      {step === 'form' && (
        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6">
          {/* Dossier info */}
          <div className="bg-navy/5 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Dossier</p>
            <p className="font-bold text-navy text-lg">{souscription.numRecu}</p>
            <p className="text-sm text-gray-600 mt-1">
              {souscription.client.prenom} {souscription.client.nom} —{' '}
              {souscription.produit.reference}
            </p>
            <p className="text-sm text-gray-500">{souscription.programme.nom}</p>
          </div>

          <div className="space-y-4">
            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (FCFA) *
              </label>
              <input
                type="number"
                {...register('montant', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
              {errors.montant && (
                <p className="text-sm text-rust mt-1">{errors.montant.message}</p>
              )}
            </div>

            {/* Mode reglement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode de règlement *
              </label>
              <select
                {...register('modeReglement')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy bg-white"
              >
                {Object.entries(modeReglementLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Reference quittance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence quittance
              </label>
              <input
                type="text"
                {...register('referenceQuittance')}
                placeholder="N° de quittance ou référence"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="ghost" type="button" fullWidth onClick={handleClose}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" fullWidth>
              Continuer
            </Button>
          </div>
        </form>
      )}

      {step === 'confirm' && formData && (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">Confirmer le paiement</p>
              <p className="text-sm text-yellow-700">Cette action est irréversible.</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Client</span>
              <span className="font-medium">
                {souscription.client.prenom} {souscription.client.nom}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Dossier</span>
              <span className="font-mono font-medium">{souscription.numRecu}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Montant</span>
              <span className="font-bold text-navy text-base">
                {formData.montant.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mode</span>
              <span className="font-medium">{modeReglementLabels[formData.modeReglement]}</span>
            </div>
            {formData.referenceQuittance && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quittance</span>
                <span className="font-medium">{formData.referenceQuittance}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              type="button"
              fullWidth
              onClick={() => setStep('form')}
              disabled={isLoading}
            >
              Retour
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirm}
              isLoading={isLoading}
            >
              Valider le paiement
            </Button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">Paiement validé !</h3>
          <p className="text-gray-500 mb-6">
            Le paiement pour le dossier <strong>{souscription.numRecu}</strong> a été enregistré.
            Une notification a été envoyée au client.
          </p>
          <Button variant="primary" fullWidth onClick={handleClose}>
            Fermer
          </Button>
        </div>
      )}
    </Modal>
  )
}

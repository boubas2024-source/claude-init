'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CategorieBadge, StatutProduitBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useForm } from 'react-hook-form'
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Programme { id: string; nom: string; ville: string }
interface Produit {
  id: string
  reference: string
  categorie: string
  surface: number
  nbPieces: number
  prixTotal: number
  fraisSouscription: number
  statut: string
  stockTotal: number
  stockDisponible: number
  programme: { id: string; nom: string; ville: string }
  _count: { souscriptions: number }
}

interface Props {
  produits: Produit[]
  programmes: Programme[]
  userRole: string
}

export function CatalogueClient({ produits, programmes, userRole }: Props) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const canEdit = ['SUPER_ADMIN', 'RESPONSABLE_PROGRAMME'].includes(userRole)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const openCreate = () => {
    setEditingProduit(null)
    reset({})
    setIsModalOpen(true)
  }

  const openEdit = (p: Produit) => {
    setEditingProduit(p)
    reset({
      programmeId: p.programme.id,
      categorie: p.categorie,
      reference: p.reference,
      surface: p.surface,
      niveaux: 1,
      nbPieces: p.nbPieces,
      prixTotal: p.prixTotal,
      fraisSouscription: p.fraisSouscription,
      stockTotal: p.stockTotal,
      stockDisponible: p.stockDisponible,
      delaiValiditeJours: 30,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true)
    try {
      const url = editingProduit
        ? `/api/backoffice/produits/${editingProduit.id}`
        : '/api/backoffice/produits'
      const method = editingProduit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          surface: parseFloat(String(data.surface)),
          niveaux: parseInt(String(data.niveaux)),
          nbPieces: parseInt(String(data.nbPieces)),
          prixTotal: parseFloat(String(data.prixTotal)),
          fraisSouscription: parseFloat(String(data.fraisSouscription)),
          stockTotal: parseInt(String(data.stockTotal)),
          stockDisponible: parseInt(String(data.stockDisponible)),
          delaiValiditeJours: parseInt(String(data.delaiValiditeJours || '30')),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur')
      }

      toast.success(editingProduit ? 'Produit mis à jour' : 'Produit créé')
      setIsModalOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    try {
      const response = await fetch(`/api/backoffice/produits/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erreur')
      toast.success('Produit supprimé')
      router.refresh()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy">Catalogue Produits</h2>
          <p className="text-gray-500">{produits.length} produit{produits.length !== 1 ? 's' : ''}</p>
        </div>
        {canEdit && (
          <Button variant="primary" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programme</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surface</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frais</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Souscrip.</th>
                {canEdit && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {produits.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-navy">{p.reference}</td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{p.programme.nom}</p>
                      <p className="text-xs text-gray-400">{p.programme.ville}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><CategorieBadge categorie={p.categorie} /></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.surface} m²</td>
                  <td className="px-4 py-3 text-sm font-medium text-navy">
                    {p.prixTotal.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-rust">
                    {p.fraisSouscription.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {p.stockDisponible}/{p.stockTotal}
                  </td>
                  <td className="px-4 py-3"><StatutProduitBadge statut={p.statut} /></td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{p._count.souscriptions}</td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4 text-rust" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduit ? 'Modifier le produit' : 'Nouveau produit'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Programme *</label>
              <select {...register('programmeId', { required: true })} className="form-input">
                <option value="">Sélectionner</option>
                {programmes.map((prog) => (
                  <option key={prog.id} value={prog.id}>{prog.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Catégorie *</label>
              <select {...register('categorie', { required: true })} className="form-input">
                <option value="">Sélectionner</option>
                <option value="DJIGUI">DJIGUI</option>
                <option value="DJIGUIYA">DJIGUIYA</option>
                <option value="HAKILI">HAKILI</option>
                <option value="HAKILI_SIGUI">HAKILI SIGUI</option>
              </select>
            </div>
            <div>
              <label className="form-label">Référence *</label>
              <input {...register('reference', { required: true })} className="form-input" placeholder="BOR-DJ-001" />
            </div>
            <div>
              <label className="form-label">Surface (m²) *</label>
              <input type="number" {...register('surface', { required: true })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Nombre de pièces *</label>
              <input type="number" {...register('nbPieces', { required: true })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Niveaux</label>
              <input type="number" {...register('niveaux')} className="form-input" defaultValue={1} />
            </div>
            <div>
              <label className="form-label">Prix total (FCFA) *</label>
              <input type="number" {...register('prixTotal', { required: true })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Frais souscription (FCFA) *</label>
              <input type="number" {...register('fraisSouscription', { required: true })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Stock total *</label>
              <input type="number" {...register('stockTotal', { required: true })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Stock disponible *</label>
              <input type="number" {...register('stockDisponible', { required: true })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Validité dossier (jours)</label>
              <input type="number" {...register('delaiValiditeJours')} className="form-input" defaultValue={30} />
            </div>
          </div>
          <div>
            <label className="form-label">Localisation</label>
            <input {...register('localisation')} className="form-input" placeholder="Secteur X, Bloc Y" />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea {...register('description')} className="form-input" rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" type="button" fullWidth onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" fullWidth isLoading={isLoading}>
              {editingProduit ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

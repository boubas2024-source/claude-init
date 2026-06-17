'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useForm } from 'react-hook-form'
import { Plus, Edit2, UserX, Shield, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Programme { id: string; nom: string }
interface Utilisateur {
  id: string; nom: string; email: string; role: string; statut: string;
  programmesAssignes: string[]; twoFactorEnabled: boolean; dateCreation: string;
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  RESPONSABLE_PROGRAMME: 'Responsable',
  AGENT_ACCUEIL: 'Agent Accueil',
}

export function UtilisateursClient({ utilisateurs, programmes, currentUserId }: {
  utilisateurs: Utilisateur[]
  programmes: Programme[]
  currentUserId: string
}) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Utilisateur | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const openCreate = () => {
    setEditingUser(null)
    reset({})
    setIsModalOpen(true)
  }

  const openEdit = (u: Utilisateur) => {
    setEditingUser(u)
    reset({ nom: u.nom, email: u.email, role: u.role })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true)
    try {
      const url = editingUser ? `/api/backoffice/utilisateurs/${editingUser.id}` : '/api/backoffice/utilisateurs'
      const method = editingUser ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Erreur')
      }
      toast.success(editingUser ? 'Utilisateur mis à jour' : 'Utilisateur créé')
      setIsModalOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('Désactiver cet utilisateur ?')) return
    try {
      await fetch(`/api/backoffice/utilisateurs/${id}`, { method: 'DELETE' })
      toast.success('Utilisateur désactivé')
      router.refresh()
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy">Utilisateurs Back-office</h2>
          <p className="text-gray-500">{utilisateurs.length} utilisateur{utilisateurs.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {utilisateurs.map((u) => (
          <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${u.statut === 'ACTIF' ? 'bg-navy/10' : 'bg-gray-100'}`}>
                  <Shield className={`h-5 w-5 ${u.statut === 'ACTIF' ? 'text-navy' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{u.nom}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
              {u.id === currentUserId && (
                <span className="text-xs bg-gold/20 text-gold-600 px-2 py-0.5 rounded-full">Vous</span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Rôle</span>
                <Badge variant={u.role === 'SUPER_ADMIN' ? 'danger' : u.role === 'RESPONSABLE_PROGRAMME' ? 'navy' : 'info'}>
                  {roleLabels[u.role]}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Statut</span>
                <Badge variant={u.statut === 'ACTIF' ? 'success' : 'default'}>
                  {u.statut === 'ACTIF' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">2FA</span>
                <span className={`flex items-center gap-1 text-xs ${u.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle className="h-3 w-3" />
                  {u.twoFactorEnabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Créé le</span>
                <span className="text-xs text-gray-600">
                  {format(new Date(u.dateCreation), 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
            </div>

            {u.id !== currentUserId && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(u)}>
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Modifier
                </Button>
                {u.statut === 'ACTIF' && (
                  <Button variant="ghost" size="sm" onClick={() => handleDeactivate(u.id)}>
                    <UserX className="h-3.5 w-3.5 text-rust" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="form-label">Nom complet *</label>
            <input {...register('nom', { required: true })} className="form-input" placeholder="Nom Prénom" />
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input type="email" {...register('email', { required: true })} className="form-input" disabled={!!editingUser} />
          </div>
          {!editingUser && (
            <div>
              <label className="form-label">Mot de passe *</label>
              <input type="password" {...register('motDePasse', { required: !editingUser })} className="form-input" placeholder="Min. 8 caractères" />
            </div>
          )}
          <div>
            <label className="form-label">Rôle *</label>
            <select {...register('role', { required: true })} className="form-input">
              <option value="">Sélectionner</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="RESPONSABLE_PROGRAMME">Responsable Programme</option>
              <option value="AGENT_ACCUEIL">Agent Accueil</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" type="button" fullWidth onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button variant="primary" type="submit" fullWidth isLoading={isLoading}>
              {editingUser ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

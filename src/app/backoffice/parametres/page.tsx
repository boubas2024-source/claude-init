import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BackofficeLayout } from '@/components/layout/BackofficeLayout'
import { Settings, Building2, Bell, Shield, Database } from 'lucide-react'

export default async function ParametresPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('bo_token')?.value
  if (!token) redirect('/backoffice/login')
  const user = await verifyToken(token)
  if (!user || user.type !== 'backoffice') redirect('/backoffice/login')

  const boUser = await prisma.utilisateurBO.findUnique({
    where: { id: user.id },
    select: { nom: true, role: true, email: true },
  })

  return (
    <BackofficeLayout user={boUser ? { nom: boUser.nom, role: boUser.role, email: boUser.email } : undefined}>
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy">Paramètres</h2>
          <p className="text-gray-500">Configuration de la plateforme IMAZ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-5 w-5 text-navy" />
              <h3 className="font-semibold text-navy">Informations agence</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Nom de la société</label>
                <input type="text" defaultValue="GIE HORONYA" className="form-input" readOnly />
              </div>
              <div>
                <label className="form-label">Nom commercial</label>
                <input type="text" defaultValue="IMAZ — L'Immobilier de A à Z" className="form-input" readOnly />
              </div>
              <div>
                <label className="form-label">Email de contact</label>
                <input type="email" defaultValue="contact@imaz.bf" className="form-input" readOnly />
              </div>
              <div>
                <label className="form-label">Pays</label>
                <input type="text" defaultValue="Burkina Faso" className="form-input" readOnly />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-navy" />
              <h3 className="font-semibold text-navy">Notifications</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Email de confirmation souscription', enabled: true },
                { label: 'SMS de confirmation souscription', enabled: true },
                { label: 'Rappel avant expiration (J-7)', enabled: true },
                { label: 'Email de confirmation paiement', enabled: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <div className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${item.enabled ? 'bg-navy' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-1 ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-navy" />
              <h3 className="font-semibold text-navy">Sécurité</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Durée de session admin (heures)</label>
                <input type="number" defaultValue="8" className="form-input" />
              </div>
              <div>
                <label className="form-label">Durée de session client (jours)</label>
                <input type="number" defaultValue="7" className="form-input" />
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-700">
                  La 2FA est recommandée pour tous les comptes admin. Activez-la dans la gestion des utilisateurs.
                </p>
              </div>
            </div>
          </div>

          {/* System */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-5 w-5 text-navy" />
              <h3 className="font-semibold text-navy">Système</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Version</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Environnement</span>
                <span className="text-sm font-medium">Production</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Base de données</span>
                <span className="text-sm font-medium text-green-600">Connectée</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">API SMS</span>
                <span className="text-sm font-medium text-yellow-600">En attente config</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackofficeLayout>
  )
}

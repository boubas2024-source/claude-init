import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BackofficeLayout } from '@/components/layout/BackofficeLayout'
import { StatutSouscriptionBadge, CategorieBadge } from '@/components/ui/Badge'
import Link from 'next/link'
import { ArrowLeft, User, Building2, CreditCard, Bell, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function SouscripteurDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('bo_token')?.value
  if (!token) redirect('/backoffice/login')
  const user = await verifyToken(token)
  if (!user || user.type !== 'backoffice') redirect('/backoffice/login')

  const boUser = await prisma.utilisateurBO.findUnique({
    where: { id: user.id },
    select: { nom: true, role: true, email: true },
  })

  const souscription = await prisma.souscription.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      produit: { include: { programme: true } },
      programme: true,
      paiements: {
        include: { agentValideur: { select: { nom: true } } },
        orderBy: { dateValidation: 'desc' },
      },
      notifications: { orderBy: { dateCreation: 'desc' }, take: 10 },
    },
  })

  if (!souscription) notFound()

  const totalPaid = souscription.paiements.reduce((sum, p) => sum + p.montant, 0)
  const modeLabels: Record<string, string> = {
    ESPECES: 'Espèces', CHEQUE: 'Chèque', VIREMENT: 'Virement',
    ORANGE_MONEY: 'Orange Money', MOOV_MONEY: 'Moov Money',
  }

  return (
    <BackofficeLayout user={boUser ? { nom: boUser.nom, role: boUser.role, email: boUser.email } : undefined}>
      <div>
        {/* Back */}
        <Link href="/backoffice/souscripteurs" className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour aux souscripteurs
        </Link>

        {/* Header */}
        <div className="bg-navy rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-navy-200 text-sm mb-1">N° Dossier</p>
              <h1 className="text-3xl font-mono font-bold">{souscription.numRecu}</h1>
              <p className="text-navy-200 mt-1">
                {souscription.client.prenom} {souscription.client.nom} — {souscription.programme.nom}
              </p>
            </div>
            <div className="text-right">
              <StatutSouscriptionBadge statut={souscription.statut} />
              {totalPaid >= souscription.produit.fraisSouscription && (
                <span className="block mt-2 text-sm text-green-300">✓ Payé</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
              <User className="h-4 w-4" /> Client
            </h3>
            <div className="space-y-3 text-sm">
              <div><p className="text-gray-400 text-xs">Nom</p><p className="font-medium">{souscription.client.prenom} {souscription.client.nom}</p></div>
              <div><p className="text-gray-400 text-xs">Email</p><p>{souscription.client.email}</p></div>
              <div><p className="text-gray-400 text-xs">Téléphone</p><p>{souscription.client.telephone}</p></div>
              {souscription.client.telephoneSecondaire && (
                <div><p className="text-gray-400 text-xs">Tel 2</p><p>{souscription.client.telephoneSecondaire}</p></div>
              )}
              {souscription.client.numIdentite && (
                <div><p className="text-gray-400 text-xs">CNIB</p><p>{souscription.client.numIdentite}</p></div>
              )}
              {souscription.client.ville && (
                <div><p className="text-gray-400 text-xs">Ville</p><p>{souscription.client.ville}</p></div>
              )}
              {souscription.client.profession && (
                <div><p className="text-gray-400 text-xs">Profession</p><p>{souscription.client.profession}</p></div>
              )}
            </div>
          </div>

          {/* Product */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Bien
            </h3>
            <div className="space-y-3 text-sm">
              <div><p className="text-gray-400 text-xs">Programme</p><p className="font-medium">{souscription.programme.nom}</p></div>
              <div><p className="text-gray-400 text-xs">Référence</p><p className="font-mono">{souscription.produit.reference}</p></div>
              <div><p className="text-gray-400 text-xs">Catégorie</p><CategorieBadge categorie={souscription.produit.categorie} /></div>
              <div><p className="text-gray-400 text-xs">Surface</p><p>{souscription.produit.surface} m²</p></div>
              <div><p className="text-gray-400 text-xs">Pièces</p><p>{souscription.produit.nbPieces}</p></div>
              <div><p className="text-gray-400 text-xs">Prix total</p><p className="font-bold text-navy">{souscription.produit.prixTotal.toLocaleString('fr-FR')} FCFA</p></div>
              <div><p className="text-gray-400 text-xs">Frais souscription</p><p className="font-bold text-rust">{souscription.produit.fraisSouscription.toLocaleString('fr-FR')} FCFA</p></div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Dates
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Date souscription</p>
                <p className="font-medium">{format(souscription.dateCreation, 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Date expiration</p>
                <p className={`font-medium ${new Date(souscription.dateExpiration) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                  {format(souscription.dateExpiration, 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-400 text-xs">Montant total payé</p>
                <p className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString('fr-FR')} FCFA</p>
                <p className="text-xs text-gray-400">sur {souscription.produit.fraisSouscription.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payments */}
        {souscription.paiements.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Paiements ({souscription.paiements.length})
            </h3>
            <div className="space-y-3">
              {souscription.paiements.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{modeLabels[p.modeReglement]}</p>
                    <p className="text-xs text-gray-400">
                      {format(p.dateValidation, 'dd/MM/yyyy HH:mm', { locale: fr })}
                      {p.agentValideur && ` — Agent: ${p.agentValideur.nom}`}
                    </p>
                    {p.referenceQuittance && (
                      <p className="text-xs text-gray-500">Quittance: {p.referenceQuittance}</p>
                    )}
                  </div>
                  <p className="font-bold text-green-700 text-lg">{p.montant.toLocaleString('fr-FR')} FCFA</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {souscription.notifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications ({souscription.notifications.length})
            </h3>
            <div className="space-y-3">
              {souscription.notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-4 p-3 border border-gray-100 rounded-lg">
                  <div className={`px-2 py-0.5 rounded text-xs font-medium mt-0.5 ${
                    n.canal === 'EMAIL' ? 'bg-blue-100 text-blue-700' : n.canal === 'SMS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {n.canal}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{n.contenu}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(n.dateCreation, 'dd/MM/yyyy HH:mm', { locale: fr })} —{' '}
                      <span className={n.statutEnvoi === 'ENVOYE' ? 'text-green-600' : n.statutEnvoi === 'ECHEC' ? 'text-red-600' : 'text-yellow-600'}>
                        {n.statutEnvoi === 'ENVOYE' ? 'Envoyé' : n.statutEnvoi === 'ECHEC' ? 'Échec' : 'En attente'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BackofficeLayout>
  )
}

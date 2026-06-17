'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StatutSouscriptionBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionLoader } from '@/components/ui/Loader'
import {
  User,
  Bell,
  FileText,
  Download,
  LogOut,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Client {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  ville: string | null
  profession: string | null
  dateCreation: string
}

interface Souscription {
  id: string
  numRecu: string
  statut: string
  dateCreation: string
  dateExpiration: string
  produit: {
    reference: string
    categorie: string
    surface: number
    nbPieces: number
    fraisSouscription: number
  }
  programme: {
    nom: string
    ville: string
  }
  paiements: Array<{ id: string; montant: number }>
}

interface Notification {
  id: string
  type: string
  contenu: string
  canal: string
  dateCreation: string
}

type Tab = 'souscriptions' | 'notifications' | 'profil'

export default function EspaceClientPage() {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [souscriptions, setSouscriptions] = useState<Souscription[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('souscriptions')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, souscriptionsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/souscriptions'),
        ])

        if (!clientRes.ok) {
          router.push('/auth/connexion')
          return
        }

        const clientData = await clientRes.json()
        const souscriptionsData = await souscriptionsRes.json()

        setClient(clientData.client)
        setSouscriptions(souscriptionsData.souscriptions || [])
      } catch (error) {
        console.error(error)
        toast.error('Erreur de chargement')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const handleDownloadReceipt = async (souscriptionId: string, numRecu: string) => {
    try {
      const response = await fetch(`/api/souscriptions/${souscriptionId}/receipt`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Erreur génération reçu')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recu-${numRecu}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erreur lors du téléchargement')
    }
  }

  if (isLoading) return <SectionLoader />
  if (!client) return null

  const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
    { id: 'souscriptions', label: 'Mes souscriptions', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profil', label: 'Mon profil', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="bg-navy rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gold/20 rounded-full p-3">
                <User className="h-8 w-8 text-gold" />
              </div>
              <div>
                <p className="text-navy-200 text-sm">Bienvenue</p>
                <h1 className="text-2xl font-bold">
                  {client.prenom} {client.nom}
                </h1>
                <p className="text-navy-200 text-sm">{client.email}</p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-navy-200 text-sm">Membre depuis</p>
              <p className="font-medium">
                {format(new Date(client.dateCreation), 'MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-navy">{souscriptions.length}</p>
            <p className="text-sm text-gray-500">Souscriptions</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {souscriptions.filter((s) => s.statut === 'VALIDEE').length}
            </p>
            <p className="text-sm text-gray-500">Validées</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {souscriptions.filter((s) => s.statut === 'EN_ATTENTE').length}
            </p>
            <p className="text-sm text-gray-500">En attente</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-navy border-b-2 border-navy bg-navy/5'
                    : 'text-gray-500 hover:text-navy'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="ml-auto flex items-center gap-2 px-6 py-4 text-sm font-medium text-rust hover:bg-rust/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Déconnexion</span>
            </button>
          </div>

          <div className="p-6">
            {/* Souscriptions tab */}
            {activeTab === 'souscriptions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-navy">Mes souscriptions</h2>
                  <Link href="/programmes">
                    <Button variant="primary" size="sm">
                      <Building2 className="h-4 w-4 mr-2" />
                      Nouvelle souscription
                    </Button>
                  </Link>
                </div>

                {souscriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-400 mb-2">Aucune souscription</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Vous n&apos;avez pas encore souscrit à un logement
                    </p>
                    <Link href="/programmes">
                      <Button variant="primary">Parcourir le catalogue</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {souscriptions.map((s) => {
                      const isPaid = s.paiements.length > 0
                      const isExpiring =
                        s.statut === 'EN_ATTENTE' &&
                        new Date(s.dateExpiration) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

                      return (
                        <div
                          key={s.id}
                          className="border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow"
                        >
                          {isExpiring && (
                            <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-50 rounded-lg">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              <p className="text-xs text-yellow-700">
                                Expire le{' '}
                                {format(new Date(s.dateExpiration), 'dd/MM/yyyy', { locale: fr })} — Payez en agence !
                              </p>
                            </div>
                          )}

                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-sm font-bold text-navy">
                                  {s.numRecu}
                                </span>
                                <StatutSouscriptionBadge statut={s.statut} />
                                {isPaid && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Payé
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-gray-800">{s.programme.nom}</p>
                              <p className="text-sm text-gray-500 font-mono">{s.produit.reference}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(s.dateCreation), 'dd/MM/yyyy', { locale: fr })}
                                </span>
                                <span>{s.produit.surface} m² — {s.produit.nbPieces} pièces</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-rust">
                                {s.produit.fraisSouscription.toLocaleString('fr-FR')} FCFA
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => handleDownloadReceipt(s.id, s.numRecu)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Reçu
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Notifications tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-bold text-navy mb-6">Notifications</h2>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400">Aucune notification</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="border border-gray-100 rounded-xl p-4"
                      >
                        <p className="text-sm text-gray-700">{n.contenu}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {format(new Date(n.dateCreation), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile tab */}
            {activeTab === 'profil' && (
              <div>
                <h2 className="text-lg font-bold text-navy mb-6">Mon profil</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-navy" />
                      <div>
                        <p className="text-xs text-gray-400">Nom complet</p>
                        <p className="font-medium">{client.prenom} {client.nom}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-navy" />
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="font-medium">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-navy" />
                      <div>
                        <p className="text-xs text-gray-400">Téléphone</p>
                        <p className="font-medium">{client.telephone}</p>
                      </div>
                    </div>
                    {client.ville && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-navy" />
                        <div>
                          <p className="text-xs text-gray-400">Ville</p>
                          <p className="font-medium">{client.ville}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/espace-client/profil">
                    <Button variant="outline">Modifier mon profil</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

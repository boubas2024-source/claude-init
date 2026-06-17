import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BackofficeLayout } from '@/components/layout/BackofficeLayout'
import { KPICard } from '@/components/dashboard/KPICard'
import { DashboardCharts } from './DashboardCharts'
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  FileText,
} from 'lucide-react'

async function getDashboardData() {
  const [
    totalSouscriptions,
    souscriptionsParStatut,
    totalClients,
    totalProduits,
    produitParStatut,
    paiementsTotal,
    recentSouscriptions,
    souscriptionsParMois,
    souscriptionsParCategorie,
  ] = await Promise.all([
    prisma.souscription.count(),
    prisma.souscription.groupBy({ by: ['statut'], _count: { id: true } }),
    prisma.client.count(),
    prisma.produit.count(),
    prisma.produit.groupBy({ by: ['statut'], _count: { id: true } }),
    prisma.paiement.aggregate({ _sum: { montant: true } }),
    prisma.souscription.findMany({
      take: 5,
      orderBy: { dateCreation: 'desc' },
      include: {
        client: { select: { nom: true, prenom: true } },
        produit: { select: { reference: true, categorie: true } },
        programme: { select: { nom: true } },
      },
    }),
    // Monthly data for chart
    prisma.$queryRaw<Array<{ month: string; count: bigint; validees: bigint }>>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "dateCreation"), 'Mon YYYY') as month,
        COUNT(*) as count,
        COUNT(CASE WHEN statut = 'VALIDEE' THEN 1 END) as validees
      FROM souscriptions
      WHERE "dateCreation" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "dateCreation")
      ORDER BY DATE_TRUNC('month', "dateCreation")
    `,
    prisma.souscription.groupBy({
      by: ['produitId'],
      _count: { id: true },
    }),
  ])

  const statutMap = Object.fromEntries(
    souscriptionsParStatut.map((s) => [s.statut, s._count.id])
  )

  const produitStatutMap = Object.fromEntries(
    produitParStatut.map((s) => [s.statut, s._count.id])
  )

  const monthlyData = (souscriptionsParMois as Array<{ month: string; count: bigint; validees: bigint }>).map((row) => ({
    month: row.month,
    total: Number(row.count),
    validees: Number(row.validees),
    enAttente: Number(row.count) - Number(row.validees),
  }))

  const conversionRate =
    totalSouscriptions > 0
      ? Math.round(((statutMap['VALIDEE'] || 0) / totalSouscriptions) * 100)
      : 0

  return {
    totalSouscriptions,
    validees: statutMap['VALIDEE'] || 0,
    enAttente: statutMap['EN_ATTENTE'] || 0,
    expirees: statutMap['EXPIREE'] || 0,
    annulees: statutMap['ANNULEE'] || 0,
    totalClients,
    totalProduits,
    disponibles: produitStatutMap['DISPONIBLE'] || 0,
    reserves: produitStatutMap['RESERVE'] || 0,
    vendus: produitStatutMap['VENDU'] || 0,
    revenusTotal: paiementsTotal._sum.montant || 0,
    conversionRate,
    recentSouscriptions,
    monthlyData,
  }
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('bo_token')?.value
  if (!token) redirect('/backoffice/login')
  const user = await verifyToken(token)
  if (!user || user.type !== 'backoffice') redirect('/backoffice/login')

  // Get user details
  const boUser = await prisma.utilisateurBO.findUnique({
    where: { id: user.id },
    select: { nom: true, role: true, email: true },
  })

  const data = await getDashboardData()

  const kpis = [
    {
      title: 'Total Souscriptions',
      value: data.totalSouscriptions.toLocaleString('fr-FR'),
      icon: FileText,
      color: 'navy' as const,
      trend: 12,
    },
    {
      title: 'Souscriptions Validées',
      value: data.validees.toLocaleString('fr-FR'),
      icon: CheckCircle,
      color: 'green' as const,
      subtitle: `${data.conversionRate}% de conversion`,
    },
    {
      title: 'En Attente',
      value: data.enAttente.toLocaleString('fr-FR'),
      icon: Clock,
      color: 'gold' as const,
    },
    {
      title: 'Clients inscrits',
      value: data.totalClients.toLocaleString('fr-FR'),
      icon: Users,
      color: 'navy' as const,
      trend: 8,
    },
    {
      title: 'Revenus collectés',
      value: `${(data.revenusTotal / 1000000).toFixed(1)}M FCFA`,
      icon: CreditCard,
      color: 'green' as const,
    },
    {
      title: 'Taux de conversion',
      value: `${data.conversionRate}%`,
      icon: TrendingUp,
      color: 'rust' as const,
    },
    {
      title: 'Biens disponibles',
      value: data.disponibles.toLocaleString('fr-FR'),
      icon: Package,
      color: 'navy' as const,
    },
    {
      title: 'Biens vendus',
      value: data.vendus.toLocaleString('fr-FR'),
      icon: Building2,
      color: 'rust' as const,
    },
  ]

  return (
    <BackofficeLayout
      user={boUser ? { nom: boUser.nom, role: boUser.role, email: boUser.email } : undefined}
    >
      <div>
        <h2 className="text-2xl font-bold text-navy mb-2">Tableau de bord</h2>
        <p className="text-gray-500 mb-8">
          Vue d&apos;ensemble des souscriptions et performances
        </p>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.slice(0, 4).map((kpi, i) => (
            <KPICard
              key={i}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
              trend={kpi.trend}
              subtitle={kpi.subtitle}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.slice(4).map((kpi, i) => (
            <KPICard
              key={i}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
              trend={kpi.trend}
              subtitle={kpi.subtitle}
            />
          ))}
        </div>

        {/* Charts */}
        <DashboardCharts monthlyData={data.monthlyData} />

        {/* Recent subscriptions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-navy font-semibold">Souscriptions récentes</h3>
            <a href="/backoffice/souscripteurs" className="text-sm text-navy hover:underline">
              Voir tout →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Dossier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programme</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentSouscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-navy font-medium">{s.numRecu}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {s.client.prenom} {s.client.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.programme.nom}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(s.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          s.statut === 'VALIDEE'
                            ? 'bg-green-100 text-green-700'
                            : s.statut === 'EN_ATTENTE'
                            ? 'bg-yellow-100 text-yellow-700'
                            : s.statut === 'EXPIREE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {s.statut === 'EN_ATTENTE' ? 'En attente'
                          : s.statut === 'VALIDEE' ? 'Validée'
                          : s.statut === 'EXPIREE' ? 'Expirée'
                          : 'Annulée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BackofficeLayout>
  )
}

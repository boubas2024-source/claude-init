import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BackofficeLayout } from '@/components/layout/BackofficeLayout'
import { RapportsClient } from './RapportsClient'

export default async function RapportsPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('bo_token')?.value
  if (!token) redirect('/backoffice/login')
  const user = await verifyToken(token)
  if (!user || user.type !== 'backoffice') redirect('/backoffice/login')

  const boUser = await prisma.utilisateurBO.findUnique({
    where: { id: user.id },
    select: { nom: true, role: true, email: true },
  })

  const [souscriptionsParProgramme, souscriptionsParCategorie, revenusParMois] = await Promise.all([
    prisma.souscription.groupBy({
      by: ['programmeId'],
      _count: { id: true },
    }),
    prisma.produit.groupBy({
      by: ['categorie'],
      _count: { id: true },
    }),
    prisma.paiement.aggregate({ _sum: { montant: true }, _count: { id: true } }),
  ])

  const programmes = await prisma.programme.findMany({ select: { id: true, nom: true } })
  const programmeMap = Object.fromEntries(programmes.map((p) => [p.id, p.nom]))

  const rapportData = {
    souscriptionsParProgramme: souscriptionsParProgramme.map((s) => ({
      programme: programmeMap[s.programmeId] || s.programmeId,
      count: s._count.id,
    })),
    souscriptionsParCategorie: souscriptionsParCategorie.map((s) => ({
      categorie: s.categorie,
      count: s._count.id,
    })),
    revenusTotal: revenusParMois._sum.montant || 0,
    totalPaiements: revenusParMois._count.id,
  }

  return (
    <BackofficeLayout user={boUser ? { nom: boUser.nom, role: boUser.role, email: boUser.email } : undefined}>
      <RapportsClient rapportData={rapportData} />
    </BackofficeLayout>
  )
}

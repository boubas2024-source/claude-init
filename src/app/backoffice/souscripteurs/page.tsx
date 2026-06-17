import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BackofficeLayout } from '@/components/layout/BackofficeLayout'
import { SouscripteursClient } from './SouscripteursClient'

export default async function SouscripteursPage({
  searchParams,
}: {
  searchParams: { page?: string; statut?: string; programme?: string; search?: string }
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('bo_token')?.value
  if (!token) redirect('/backoffice/login')
  const user = await verifyToken(token)
  if (!user || user.type !== 'backoffice') redirect('/backoffice/login')

  const boUser = await prisma.utilisateurBO.findUnique({
    where: { id: user.id },
    select: { nom: true, role: true, email: true },
  })

  const page = parseInt(searchParams.page || '1')
  const perPage = 20
  const skip = (page - 1) * perPage

  const where: Record<string, unknown> = {}
  if (searchParams.statut) where.statut = searchParams.statut
  if (searchParams.programme) where.programmeId = searchParams.programme
  if (searchParams.search) {
    where.OR = [
      { numRecu: { contains: searchParams.search, mode: 'insensitive' } },
      { client: { nom: { contains: searchParams.search, mode: 'insensitive' } } },
      { client: { prenom: { contains: searchParams.search, mode: 'insensitive' } } },
      { client: { telephone: { contains: searchParams.search } } },
    ]
  }

  const [souscriptions, total, programmes] = await Promise.all([
    prisma.souscription.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { dateCreation: 'desc' },
      include: {
        client: { select: { nom: true, prenom: true, telephone: true, email: true } },
        produit: { select: { reference: true, categorie: true, fraisSouscription: true } },
        programme: { select: { nom: true } },
        paiements: { select: { id: true, montant: true } },
      },
    }),
    prisma.souscription.count({ where }),
    prisma.programme.findMany({ select: { id: true, nom: true } }),
  ])

  return (
    <BackofficeLayout user={boUser ? { nom: boUser.nom, role: boUser.role, email: boUser.email } : undefined}>
      <SouscripteursClient
        souscriptions={JSON.parse(JSON.stringify(souscriptions))}
        total={total}
        page={page}
        perPage={perPage}
        programmes={programmes}
      />
    </BackofficeLayout>
  )
}

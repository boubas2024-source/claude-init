import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BackofficeLayout } from '@/components/layout/BackofficeLayout'
import { CatalogueClient } from './CatalogueClient'

export default async function CataloguePage() {
  const cookieStore = cookies()
  const token = cookieStore.get('bo_token')?.value
  if (!token) redirect('/backoffice/login')
  const user = await verifyToken(token)
  if (!user || user.type !== 'backoffice') redirect('/backoffice/login')

  const boUser = await prisma.utilisateurBO.findUnique({
    where: { id: user.id },
    select: { nom: true, role: true, email: true },
  })

  const [produits, programmes] = await Promise.all([
    prisma.produit.findMany({
      orderBy: { dateCreation: 'desc' },
      include: {
        programme: { select: { id: true, nom: true, ville: true } },
        _count: { select: { souscriptions: true } },
      },
    }),
    prisma.programme.findMany({ select: { id: true, nom: true, ville: true } }),
  ])

  return (
    <BackofficeLayout user={boUser ? { nom: boUser.nom, role: boUser.role, email: boUser.email } : undefined}>
      <CatalogueClient
        produits={JSON.parse(JSON.stringify(produits))}
        programmes={programmes}
        userRole={user.role || ''}
      />
    </BackofficeLayout>
  )
}

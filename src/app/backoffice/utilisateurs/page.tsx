import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BackofficeLayout } from '@/components/layout/BackofficeLayout'
import { UtilisateursClient } from './UtilisateursClient'

export default async function UtilisateursPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('bo_token')?.value
  if (!token) redirect('/backoffice/login')
  const user = await verifyToken(token)
  if (!user || user.type !== 'backoffice' || user.role !== 'SUPER_ADMIN') {
    redirect('/backoffice/dashboard')
  }

  const boUser = await prisma.utilisateurBO.findUnique({
    where: { id: user.id },
    select: { nom: true, role: true, email: true },
  })

  const utilisateurs = await prisma.utilisateurBO.findMany({
    orderBy: { dateCreation: 'desc' },
    select: {
      id: true, nom: true, email: true, role: true, statut: true,
      programmesAssignes: true, twoFactorEnabled: true, dateCreation: true,
    },
  })

  const programmes = await prisma.programme.findMany({ select: { id: true, nom: true } })

  return (
    <BackofficeLayout user={boUser ? { nom: boUser.nom, role: boUser.role, email: boUser.email } : undefined}>
      <UtilisateursClient
        utilisateurs={JSON.parse(JSON.stringify(utilisateurs))}
        programmes={programmes}
        currentUserId={user.id}
      />
    </BackofficeLayout>
  )
}

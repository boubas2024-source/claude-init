import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { nom, role, statut, programmesAssignes } = body

    const utilisateur = await prisma.utilisateurBO.update({
      where: { id: params.id },
      data: { nom, role, statut, programmesAssignes },
      select: { id: true, nom: true, email: true, role: true, statut: true },
    })

    await createAuditLog({
      utilisateurId: auth.id,
      action: AUDIT_ACTIONS.BO_USER_UPDATED,
      details: { updatedId: utilisateur.id },
    })

    return NextResponse.json({ utilisateur })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  if (params.id === auth.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 })
  }

  try {
    await prisma.utilisateurBO.update({
      where: { id: params.id },
      data: { statut: 'INACTIF' },
    })

    await createAuditLog({
      utilisateurId: auth.id,
      action: AUDIT_ACTIONS.BO_USER_DELETED,
      details: { deletedId: params.id },
    })

    return NextResponse.json({ message: 'Utilisateur désactivé' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

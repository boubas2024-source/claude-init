import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { produitSchema } from '@/lib/validation'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireBackofficeAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const produit = await prisma.produit.findUnique({
      where: { id: params.id },
      include: {
        programme: true,
        souscriptions: {
          orderBy: { dateCreation: 'desc' },
          take: 10,
          include: { client: { select: { nom: true, prenom: true } } },
        },
      },
    })
    if (!produit) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    return NextResponse.json({ produit })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN', 'RESPONSABLE_PROGRAMME'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const validation = produitSchema.partial().safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const produit = await prisma.produit.update({
      where: { id: params.id },
      data: validation.data,
    })

    await createAuditLog({
      utilisateurId: auth.id,
      action: AUDIT_ACTIONS.PRODUIT_UPDATED,
      details: { produitId: produit.id },
    })

    return NextResponse.json({ produit })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    await prisma.produit.delete({ where: { id: params.id } })

    await createAuditLog({
      utilisateurId: auth.id,
      action: AUDIT_ACTIONS.PRODUIT_DELETED,
      details: { produitId: params.id },
    })

    return NextResponse.json({ message: 'Produit supprimé' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

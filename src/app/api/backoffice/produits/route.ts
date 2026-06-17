import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { produitSchema } from '@/lib/validation'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const auth = await requireBackofficeAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const produits = await prisma.produit.findMany({
      orderBy: { dateCreation: 'desc' },
      include: {
        programme: { select: { nom: true, ville: true } },
        _count: { select: { souscriptions: true } },
      },
    })
    return NextResponse.json({ produits })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN', 'RESPONSABLE_PROGRAMME'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const validation = produitSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides', details: validation.error.flatten() }, { status: 400 })
    }

    const produit = await prisma.produit.create({ data: validation.data })

    await createAuditLog({
      utilisateurId: auth.id,
      action: AUDIT_ACTIONS.PRODUIT_CREATED,
      details: { produitId: produit.id, reference: produit.reference },
    })

    return NextResponse.json({ produit }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

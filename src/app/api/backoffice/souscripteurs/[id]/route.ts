import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireBackofficeAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const souscription = await prisma.souscription.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        produit: { include: { programme: true } },
        programme: true,
        paiements: {
          include: { agentValideur: { select: { nom: true, email: true } } },
          orderBy: { dateValidation: 'desc' },
        },
        notifications: { orderBy: { dateCreation: 'desc' } },
      },
    })

    if (!souscription) {
      return NextResponse.json({ error: 'Souscription introuvable' }, { status: 404 })
    }

    return NextResponse.json({ souscription })
  } catch (error) {
    console.error('Souscription detail error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

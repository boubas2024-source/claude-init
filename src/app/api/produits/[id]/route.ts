import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const produit = await prisma.produit.findUnique({
      where: { id: params.id },
      include: {
        programme: true,
      },
    })

    if (!produit) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    return NextResponse.json({ produit })
  } catch (error) {
    console.error('Produit error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

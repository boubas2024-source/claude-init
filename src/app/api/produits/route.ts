import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorie = searchParams.get('categorie')
    const programmeId = searchParams.get('programme')
    const statut = searchParams.get('statut')

    const where: Record<string, unknown> = {}
    if (categorie) where.categorie = categorie
    if (programmeId) where.programmeId = programmeId
    if (statut) where.statut = statut

    const produits = await prisma.produit.findMany({
      where,
      orderBy: { dateCreation: 'desc' },
      include: {
        programme: { select: { id: true, nom: true, ville: true } },
      },
    })

    return NextResponse.json({ produits })
  } catch (error) {
    console.error('Produits error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

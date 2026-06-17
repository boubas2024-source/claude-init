import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = await requireBackofficeAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q) {
      return NextResponse.json({ error: 'Paramètre de recherche requis' }, { status: 400 })
    }

    const souscription = await prisma.souscription.findFirst({
      where: {
        OR: [
          { numRecu: { contains: q, mode: 'insensitive' } },
          { client: { nom: { contains: q, mode: 'insensitive' } } },
          { client: { prenom: { contains: q, mode: 'insensitive' } } },
          { client: { telephone: { contains: q } } },
        ],
      },
      orderBy: { dateCreation: 'desc' },
      include: {
        client: { select: { nom: true, prenom: true, telephone: true, email: true } },
        produit: {
          select: {
            reference: true,
            categorie: true,
            fraisSouscription: true,
            surface: true,
            nbPieces: true,
          },
        },
        programme: { select: { nom: true, ville: true } },
        paiements: {
          select: { id: true, montant: true, modeReglement: true, dateValidation: true },
          orderBy: { dateValidation: 'desc' },
        },
      },
    })

    if (!souscription) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    return NextResponse.json({ souscription })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = await requireBackofficeAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '20')
    const statut = searchParams.get('statut')
    const programmeId = searchParams.get('programme')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (statut) where.statut = statut
    if (programmeId) where.programmeId = programmeId
    if (search) {
      where.OR = [
        { numRecu: { contains: search, mode: 'insensitive' } },
        { client: { nom: { contains: search, mode: 'insensitive' } } },
        { client: { prenom: { contains: search, mode: 'insensitive' } } },
        { client: { telephone: { contains: search } } },
      ]
    }

    const [souscriptions, total] = await Promise.all([
      prisma.souscription.findMany({
        where,
        skip: (page - 1) * perPage,
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
    ])

    return NextResponse.json({ souscriptions, total, page, perPage })
  } catch (error) {
    console.error('Souscripteurs GET error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

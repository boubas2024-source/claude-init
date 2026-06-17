import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const programmes = await prisma.programme.findMany({
      orderBy: { nom: 'asc' },
      include: {
        _count: { select: { produits: true, souscriptions: true } },
      },
    })
    return NextResponse.json({ programmes })
  } catch (error) {
    console.error('Programmes error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

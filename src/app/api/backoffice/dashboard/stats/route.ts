import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = await requireBackofficeAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const [
      totalSouscriptions,
      souscriptionsParStatut,
      totalClients,
      revenusTotal,
      produitsParStatut,
    ] = await Promise.all([
      prisma.souscription.count(),
      prisma.souscription.groupBy({ by: ['statut'], _count: { id: true } }),
      prisma.client.count(),
      prisma.paiement.aggregate({ _sum: { montant: true } }),
      prisma.produit.groupBy({ by: ['statut'], _count: { id: true } }),
    ])

    const statutMap = Object.fromEntries(
      souscriptionsParStatut.map((s) => [s.statut, s._count.id])
    )
    const produitStatutMap = Object.fromEntries(
      produitsParStatut.map((s) => [s.statut, s._count.id])
    )

    return NextResponse.json({
      totalSouscriptions,
      validees: statutMap['VALIDEE'] || 0,
      enAttente: statutMap['EN_ATTENTE'] || 0,
      expirees: statutMap['EXPIREE'] || 0,
      annulees: statutMap['ANNULEE'] || 0,
      totalClients,
      revenusTotal: revenusTotal._sum.montant || 0,
      disponibles: produitStatutMap['DISPONIBLE'] || 0,
      reserves: produitStatutMap['RESERVE'] || 0,
      vendus: produitStatutMap['VENDU'] || 0,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

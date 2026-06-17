import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = await requireBackofficeAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const [
      souscriptionsParProgramme,
      souscriptionsParCategorie,
      souscriptionsParStatut,
      revenusParMode,
      totalPaiements,
      topProduits,
    ] = await Promise.all([
      // By programme
      prisma.$queryRaw<Array<{ programme: string; count: bigint }>>`
        SELECT p.nom as programme, COUNT(s.id) as count
        FROM souscriptions s
        JOIN programmes p ON s."programmeId" = p.id
        GROUP BY p.nom
        ORDER BY count DESC
      `,
      // By category
      prisma.$queryRaw<Array<{ categorie: string; count: bigint }>>`
        SELECT pr.categorie, COUNT(s.id) as count
        FROM souscriptions s
        JOIN produits pr ON s."produitId" = pr.id
        GROUP BY pr.categorie
        ORDER BY count DESC
      `,
      // By statut
      prisma.souscription.groupBy({
        by: ['statut'],
        _count: { id: true },
      }),
      // Revenues by mode
      prisma.paiement.groupBy({
        by: ['modeReglement'],
        _sum: { montant: true },
        _count: { id: true },
      }),
      // Total
      prisma.paiement.aggregate({
        _sum: { montant: true },
        _count: { id: true },
      }),
      // Top products by subscriptions
      prisma.$queryRaw<Array<{ reference: string; categorie: string; count: bigint }>>`
        SELECT pr.reference, pr.categorie, COUNT(s.id) as count
        FROM souscriptions s
        JOIN produits pr ON s."produitId" = pr.id
        GROUP BY pr.reference, pr.categorie
        ORDER BY count DESC
        LIMIT 5
      `,
    ])

    return NextResponse.json({
      souscriptionsParProgramme: (souscriptionsParProgramme as Array<{ programme: string; count: bigint }>).map((r) => ({
        programme: r.programme,
        count: Number(r.count),
      })),
      souscriptionsParCategorie: (souscriptionsParCategorie as Array<{ categorie: string; count: bigint }>).map((r) => ({
        categorie: r.categorie,
        count: Number(r.count),
      })),
      souscriptionsParStatut: souscriptionsParStatut.map((s) => ({
        statut: s.statut,
        count: s._count.id,
      })),
      revenusParMode: revenusParMode.map((r) => ({
        mode: r.modeReglement,
        montant: r._sum.montant || 0,
        count: r._count.id,
      })),
      revenusTotal: totalPaiements._sum.montant || 0,
      totalPaiements: totalPaiements._count.id,
      topProduits: (topProduits as Array<{ reference: string; categorie: string; count: bigint }>).map((p) => ({
        reference: p.reference,
        categorie: p.categorie,
        count: Number(p.count),
      })),
    })
  } catch (error) {
    console.error('Rapports error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

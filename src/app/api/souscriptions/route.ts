import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireClientAuth } from '@/lib/auth'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { sendSubscriptionConfirmation } from '@/lib/notifications'
import { addDays } from 'date-fns'

function generateNumRecu(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `IMA-${year}${month}${day}-${random}`
}

export async function POST(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { produitId, accepteCGV } = body

    if (!accepteCGV) {
      return NextResponse.json({ error: 'Vous devez accepter les CGV' }, { status: 400 })
    }

    if (!produitId) {
      return NextResponse.json({ error: 'Produit requis' }, { status: 400 })
    }

    // Get product
    const produit = await prisma.produit.findUnique({
      where: { id: produitId },
      include: { programme: true },
    })

    if (!produit) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    if (produit.statut !== 'DISPONIBLE' || produit.stockDisponible <= 0) {
      return NextResponse.json({ error: 'Ce produit n\'est plus disponible' }, { status: 409 })
    }

    // Check if client already has active souscription for this product
    const existing = await prisma.souscription.findFirst({
      where: {
        clientId: auth.id,
        produitId,
        statut: { in: ['EN_ATTENTE', 'VALIDEE'] },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Vous avez déjà une souscription active pour ce produit' },
        { status: 409 }
      )
    }

    const dateExpiration = addDays(new Date(), produit.delaiValiditeJours)
    const numRecu = generateNumRecu()

    // Create souscription and decrease stock in transaction
    const souscription = await prisma.$transaction(async (tx) => {
      const created = await tx.souscription.create({
        data: {
          clientId: auth.id,
          produitId,
          programmeId: produit.programmeId,
          numRecu,
          dateExpiration,
          statut: 'EN_ATTENTE',
        },
      })

      await tx.produit.update({
        where: { id: produitId },
        data: {
          stockDisponible: { decrement: 1 },
          statut: produit.stockDisponible - 1 <= 0 ? 'RESERVE' : 'DISPONIBLE',
        },
      })

      return created
    })

    // Get client info for notifications
    const client = await prisma.client.findUnique({
      where: { id: auth.id },
    })

    if (client) {
      // Send notifications asynchronously (don't block response)
      sendSubscriptionConfirmation({
        souscriptionId: souscription.id,
        clientEmail: client.email,
        clientTelephone: client.telephone,
        clientPrenom: client.prenom,
        clientNom: client.nom,
        numRecu,
        produitReference: produit.reference,
        programme: produit.programme.nom,
        fraisSouscription: produit.fraisSouscription,
        dateExpiration,
      }).catch(console.error)
    }

    await createAuditLog({
      utilisateurId: undefined,
      action: AUDIT_ACTIONS.SOUSCRIPTION_CREATED,
      details: { souscriptionId: souscription.id, clientId: auth.id, produitId, numRecu },
    })

    return NextResponse.json(
      {
        message: 'Souscription créée avec succès',
        id: souscription.id,
        numRecu,
        dateExpiration: dateExpiration.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Souscription error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const souscriptions = await prisma.souscription.findMany({
      where: { clientId: auth.id },
      orderBy: { dateCreation: 'desc' },
      include: {
        produit: {
          select: {
            reference: true,
            categorie: true,
            surface: true,
            nbPieces: true,
            fraisSouscription: true,
          },
        },
        programme: { select: { nom: true, ville: true } },
        paiements: { select: { id: true, montant: true, dateValidation: true } },
      },
    })

    return NextResponse.json({ souscriptions })
  } catch (error) {
    console.error('Souscriptions GET error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

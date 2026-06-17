import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { sendPaymentConfirmation } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN', 'AGENT_ACCUEIL'])
  if (auth instanceof NextResponse) return auth

  try {
    const { souscriptionId, montant, modeReglement, referenceQuittance } = await request.json()

    if (!souscriptionId || !montant || !modeReglement) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const souscription = await prisma.souscription.findUnique({
      where: { id: souscriptionId },
      include: {
        client: true,
        produit: true,
        programme: true,
      },
    })

    if (!souscription) {
      return NextResponse.json({ error: 'Souscription introuvable' }, { status: 404 })
    }

    if (souscription.statut !== 'EN_ATTENTE') {
      return NextResponse.json(
        { error: `Ce dossier a le statut "${souscription.statut}" et ne peut pas être payé` },
        { status: 409 }
      )
    }

    if (new Date(souscription.dateExpiration) < new Date()) {
      return NextResponse.json({ error: 'Ce dossier est expiré' }, { status: 409 })
    }

    const paiement = await prisma.$transaction(async (tx) => {
      const created = await tx.paiement.create({
        data: {
          souscriptionId,
          montant,
          modeReglement,
          referenceQuittance,
          agentValideurId: auth.id,
        },
      })

      await tx.souscription.update({
        where: { id: souscriptionId },
        data: { statut: 'VALIDEE' },
      })

      await tx.produit.update({
        where: { id: souscription.produitId },
        data: { statut: 'VENDU' },
      })

      return created
    })

    // Send notifications
    sendPaymentConfirmation({
      souscriptionId,
      clientEmail: souscription.client.email,
      clientTelephone: souscription.client.telephone,
      clientPrenom: souscription.client.prenom,
      clientNom: souscription.client.nom,
      numRecu: souscription.numRecu,
      montant,
      modeReglement,
      dateValidation: new Date(),
    }).catch(console.error)

    await createAuditLog({
      utilisateurId: auth.id,
      action: AUDIT_ACTIONS.PAIEMENT_CREATED,
      details: {
        paiementId: paiement.id,
        souscriptionId,
        montant,
        modeReglement,
        numRecu: souscription.numRecu,
      },
    })

    return NextResponse.json({
      message: 'Paiement validé avec succès',
      paiement: { id: paiement.id, montant, modeReglement },
    })
  } catch (error) {
    console.error('Paiement error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

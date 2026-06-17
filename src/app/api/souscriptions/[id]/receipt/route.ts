import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireClientAuth } from '@/lib/auth'
import { generateReceiptPDF } from '@/lib/pdf'
import { generateReceiptQRCode } from '@/lib/qrcode'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireClientAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const souscription = await prisma.souscription.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        produit: true,
        programme: true,
      },
    })

    if (!souscription) {
      return NextResponse.json({ error: 'Souscription introuvable' }, { status: 404 })
    }

    // Verify ownership
    if (souscription.clientId !== auth.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const qrCodeDataUrl = await generateReceiptQRCode(souscription.numRecu, appUrl)

    const pdfBuffer = await generateReceiptPDF({
      numRecu: souscription.numRecu,
      dateCreation: souscription.dateCreation,
      dateExpiration: souscription.dateExpiration,
      client: {
        nom: souscription.client.nom,
        prenom: souscription.client.prenom,
        telephone: souscription.client.telephone,
        email: souscription.client.email,
        numIdentite: souscription.client.numIdentite || undefined,
      },
      produit: {
        reference: souscription.produit.reference,
        categorie: souscription.produit.categorie,
        surface: souscription.produit.surface,
        nbPieces: souscription.produit.nbPieces,
        prixTotal: souscription.produit.prixTotal,
        fraisSouscription: souscription.produit.fraisSouscription,
      },
      programme: {
        nom: souscription.programme.nom,
        ville: souscription.programme.ville,
      },
      qrCodeDataUrl,
    })

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recu-${souscription.numRecu}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Receipt generation error:', error)
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  }
}

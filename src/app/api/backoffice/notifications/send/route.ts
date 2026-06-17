import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { sendSMS } from '@/lib/sms'
import { StatutEnvoi, TypeNotification, CanalNotification } from '@prisma/client'

export async function POST(request: NextRequest) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN', 'RESPONSABLE_PROGRAMME'])
  if (auth instanceof NextResponse) return auth

  try {
    const { souscriptionId, canal, contenu, type } = await request.json()

    if (!souscriptionId || !canal || !contenu) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const souscription = await prisma.souscription.findUnique({
      where: { id: souscriptionId },
      include: { client: true },
    })

    if (!souscription) {
      return NextResponse.json({ error: 'Souscription introuvable' }, { status: 404 })
    }

    let success = false

    if (canal === 'EMAIL') {
      success = await sendEmail({
        to: souscription.client.email,
        subject: 'Message de votre agence IMAZ',
        html: `<div style="font-family:Arial,sans-serif;padding:20px"><p>${contenu}</p></div>`,
      })
    } else if (canal === 'SMS') {
      const result = await sendSMS({
        to: souscription.client.telephone,
        message: contenu,
      })
      success = result.success
    }

    const notification = await prisma.notification.create({
      data: {
        souscriptionId,
        type: (type as TypeNotification) || TypeNotification.MESSAGE_GENERAL,
        canal: canal as CanalNotification,
        contenu,
        statutEnvoi: success ? StatutEnvoi.ENVOYE : StatutEnvoi.ECHEC,
        dateEnvoi: success ? new Date() : null,
      },
    })

    return NextResponse.json({ notification, success })
  } catch (error) {
    console.error('Notification send error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

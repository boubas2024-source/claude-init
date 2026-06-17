import { prisma } from './prisma'
import { sendEmail, getSubscriptionConfirmationEmail, getPaymentConfirmationEmail } from './email'
import { sendSMS, getSubscriptionSMS, getPaymentSMS } from './sms'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  TypeNotification,
  CanalNotification,
  StatutEnvoi,
} from '@prisma/client'

interface SubscriptionNotificationData {
  souscriptionId: string
  clientEmail: string
  clientTelephone: string
  clientPrenom: string
  clientNom: string
  numRecu: string
  produitReference: string
  programme: string
  fraisSouscription: number
  dateExpiration: Date
}

interface PaymentNotificationData {
  souscriptionId: string
  clientEmail: string
  clientTelephone: string
  clientPrenom: string
  clientNom: string
  numRecu: string
  montant: number
  modeReglement: string
  dateValidation: Date
}

export async function sendSubscriptionConfirmation(
  data: SubscriptionNotificationData
): Promise<void> {
  const dateExpirationStr = format(data.dateExpiration, 'dd MMMM yyyy', { locale: fr })

  // Send email
  const emailContent = getSubscriptionConfirmationEmail({
    prenom: data.clientPrenom,
    nom: data.clientNom,
    numRecu: data.numRecu,
    produitReference: data.produitReference,
    programme: data.programme,
    fraisSouscription: data.fraisSouscription,
    dateExpiration: dateExpirationStr,
  })

  const emailSent = await sendEmail({
    to: data.clientEmail,
    subject: `IMAZ - Confirmation de votre souscription N°${data.numRecu}`,
    html: emailContent,
  })

  await prisma.notification.create({
    data: {
      souscriptionId: data.souscriptionId,
      type: TypeNotification.SOUSCRIPTION_CONFIRMEE,
      canal: CanalNotification.EMAIL,
      contenu: emailContent,
      statutEnvoi: emailSent ? StatutEnvoi.ENVOYE : StatutEnvoi.ECHEC,
      dateEnvoi: emailSent ? new Date() : null,
    },
  })

  // Send SMS
  const smsContent = getSubscriptionSMS({
    prenom: data.clientPrenom,
    numRecu: data.numRecu,
    fraisSouscription: data.fraisSouscription,
    dateExpiration: dateExpirationStr,
  })

  const smsResult = await sendSMS({
    to: data.clientTelephone,
    message: smsContent,
  })

  await prisma.notification.create({
    data: {
      souscriptionId: data.souscriptionId,
      type: TypeNotification.SOUSCRIPTION_CONFIRMEE,
      canal: CanalNotification.SMS,
      contenu: smsContent,
      statutEnvoi: smsResult.success ? StatutEnvoi.ENVOYE : StatutEnvoi.ECHEC,
      dateEnvoi: smsResult.success ? new Date() : null,
    },
  })
}

export async function sendPaymentConfirmation(
  data: PaymentNotificationData
): Promise<void> {
  const dateValidationStr = format(data.dateValidation, 'dd MMMM yyyy à HH:mm', { locale: fr })

  const emailContent = getPaymentConfirmationEmail({
    prenom: data.clientPrenom,
    nom: data.clientNom,
    numRecu: data.numRecu,
    montant: data.montant,
    modeReglement: data.modeReglement,
    dateValidation: dateValidationStr,
  })

  const emailSent = await sendEmail({
    to: data.clientEmail,
    subject: `IMAZ - Confirmation de paiement - Dossier N°${data.numRecu}`,
    html: emailContent,
  })

  await prisma.notification.create({
    data: {
      souscriptionId: data.souscriptionId,
      type: TypeNotification.PAIEMENT_RECU,
      canal: CanalNotification.EMAIL,
      contenu: emailContent,
      statutEnvoi: emailSent ? StatutEnvoi.ENVOYE : StatutEnvoi.ECHEC,
      dateEnvoi: emailSent ? new Date() : null,
    },
  })

  const smsContent = getPaymentSMS({
    prenom: data.clientPrenom,
    numRecu: data.numRecu,
    montant: data.montant,
  })

  const smsResult = await sendSMS({
    to: data.clientTelephone,
    message: smsContent,
  })

  await prisma.notification.create({
    data: {
      souscriptionId: data.souscriptionId,
      type: TypeNotification.PAIEMENT_RECU,
      canal: CanalNotification.SMS,
      contenu: smsContent,
      statutEnvoi: smsResult.success ? StatutEnvoi.ENVOYE : StatutEnvoi.ECHEC,
      dateEnvoi: smsResult.success ? new Date() : null,
    },
  })
}

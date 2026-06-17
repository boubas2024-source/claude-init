import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'IMAZ <noreply@imaz.bf>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export function getSubscriptionConfirmationEmail(data: {
  prenom: string
  nom: string
  numRecu: string
  produitReference: string
  programme: string
  fraisSouscription: number
  dateExpiration: string
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de souscription IMAZ</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background-color: #1A3A5C; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">IMAZ</h1>
      <p style="color: #D4A017; margin: 5px 0 0 0; font-size: 14px;">L'Immobilier de A à Z — GIE HORONYA</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #1A3A5C; margin-top: 0;">Votre souscription est confirmée !</h2>

      <p>Bonjour <strong>${data.prenom} ${data.nom}</strong>,</p>

      <p>Nous avons bien enregistré votre souscription. Voici les détails :</p>

      <div style="background-color: #f9f9f9; border-left: 4px solid #1A3A5C; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0;"><strong>N° de dossier :</strong> ${data.numRecu}</p>
        <p style="margin: 5px 0;"><strong>Programme :</strong> ${data.programme}</p>
        <p style="margin: 5px 0;"><strong>Référence du bien :</strong> ${data.produitReference}</p>
        <p style="margin: 5px 0;"><strong>Frais de souscription :</strong> ${data.fraisSouscription.toLocaleString('fr-FR')} FCFA</p>
        <p style="margin: 5px 0;"><strong>Date d'expiration :</strong> ${data.dateExpiration}</p>
      </div>

      <div style="background-color: #FFF8E1; border: 1px solid #D4A017; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; color: #333; font-size: 14px;">
          <strong style="color: #C0392B;">⚠️ Action requise :</strong>
          Vous devez effectuer le paiement des frais de souscription en agence IMAZ
          avant le <strong>${data.dateExpiration}</strong>.
        </p>
      </div>

      <p>Nos agences sont ouvertes du lundi au vendredi de 8h à 17h et le samedi de 8h à 12h.</p>

      <p style="color: #666; font-size: 13px;">
        Pour toute question, contactez-nous :<br>
        Email : contact@imaz.bf<br>
        Tél : +226 XX XX XX XX
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        © 2024 IMAZ — GIE HORONYA — Burkina Faso<br>
        Ce message est envoyé automatiquement, merci de ne pas y répondre.
      </p>
    </div>
  </div>
</body>
</html>
`
}

export function getPaymentConfirmationEmail(data: {
  prenom: string
  nom: string
  numRecu: string
  montant: number
  modeReglement: string
  dateValidation: string
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Confirmation de paiement IMAZ</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background-color: #1A3A5C; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">IMAZ</h1>
      <p style="color: #D4A017; margin: 5px 0 0 0; font-size: 14px;">L'Immobilier de A à Z</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #27AE60;">Paiement reçu avec succès ✓</h2>
      <p>Bonjour <strong>${data.prenom} ${data.nom}</strong>,</p>
      <p>Nous confirmons la réception de votre paiement :</p>
      <div style="background-color: #f9f9f9; border-left: 4px solid #27AE60; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0;"><strong>Dossier :</strong> ${data.numRecu}</p>
        <p style="margin: 5px 0;"><strong>Montant :</strong> ${data.montant.toLocaleString('fr-FR')} FCFA</p>
        <p style="margin: 5px 0;"><strong>Mode :</strong> ${data.modeReglement}</p>
        <p style="margin: 5px 0;"><strong>Date :</strong> ${data.dateValidation}</p>
      </div>
      <p>Votre dossier est maintenant validé. Notre équipe prendra contact avec vous pour la suite du processus.</p>
    </div>
    <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
      <p style="color: #999; font-size: 12px; margin: 0;">© 2024 IMAZ — GIE HORONYA — Burkina Faso</p>
    </div>
  </div>
</body>
</html>
`
}

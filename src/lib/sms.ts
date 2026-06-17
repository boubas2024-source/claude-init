// Stub for Faso SMS API integration
// Replace with actual Faso SMS API implementation when available

interface SMSOptions {
  to: string
  message: string
}

interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendSMS(options: SMSOptions): Promise<SMSResponse> {
  // In production, replace with actual Faso SMS API call
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SMS STUB] To: ${options.to}, Message: ${options.message}`)
    return { success: true, messageId: `dev-${Date.now()}` }
  }

  try {
    const apiKey = process.env.FASO_SMS_API_KEY
    const sender = process.env.FASO_SMS_SENDER || 'IMAZ'

    if (!apiKey) {
      throw new Error('FASO_SMS_API_KEY not configured')
    }

    // Faso SMS API endpoint (placeholder - replace with real endpoint)
    const response = await fetch('https://api.fasosms.bf/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        sender,
        recipient: options.to,
        message: options.message,
      }),
    })

    if (!response.ok) {
      throw new Error(`SMS API error: ${response.statusText}`)
    }

    const result = await response.json()
    return { success: true, messageId: result.id }
  } catch (error) {
    console.error('SMS send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function getSubscriptionSMS(data: {
  prenom: string
  numRecu: string
  fraisSouscription: number
  dateExpiration: string
}): string {
  return `IMAZ: Bonsoir ${data.prenom}, votre dossier N°${data.numRecu} est enregistré. Frais: ${data.fraisSouscription.toLocaleString('fr-FR')} FCFA à payer avant le ${data.dateExpiration} en agence.`
}

export function getPaymentSMS(data: {
  prenom: string
  numRecu: string
  montant: number
}): string {
  return `IMAZ: Paiement confirmé. Dossier N°${data.numRecu}. Montant: ${data.montant.toLocaleString('fr-FR')} FCFA reçu. Merci ${data.prenom}.`
}

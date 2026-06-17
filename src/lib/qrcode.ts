import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1A3A5C',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
    return qrDataUrl
  } catch (error) {
    console.error('QR code generation error:', error)
    throw new Error('Erreur lors de la génération du QR code')
  }
}

export async function generateReceiptQRCode(numRecu: string, appUrl: string): Promise<string> {
  const verificationUrl = `${appUrl}/verifier-recu/${numRecu}`
  return generateQRCode(verificationUrl)
}

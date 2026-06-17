/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface ReceiptData {
  numRecu: string
  dateCreation: Date
  dateExpiration: Date
  client: {
    nom: string
    prenom: string
    telephone: string
    email: string
    numIdentite?: string
  }
  produit: {
    reference: string
    categorie: string
    surface: number
    nbPieces: number
    prixTotal: number
    fraisSouscription: number
  }
  programme: {
    nom: string
    ville: string
  }
  qrCodeDataUrl?: string
}

function getCategorieLabel(categorie: string): string {
  const labels: Record<string, string> = {
    DJIGUI: 'DJIGUI (UHP)',
    DJIGUIYA: 'DJIGUIYA (F3/F4)',
    HAKILI: 'HAKILI (Villa standard)',
    HAKILI_SIGUI: 'HAKILI SIGUI (Villa prestige)',
  }
  return labels[categorie] || categorie
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  // Dynamic import for server-side only
  const pdfMake = await import('pdfmake/build/pdfmake')
  const pdfFonts = await import('pdfmake/build/vfs_fonts')

  const pdfMakeInstance = (pdfMake as any).default || pdfMake
  pdfMakeInstance.vfs = (pdfFonts as any).default?.pdfMake?.vfs || (pdfFonts as any).pdfMake?.vfs

  const dateFormatted = format(data.dateCreation, 'dd MMMM yyyy à HH:mm', { locale: fr })
  const dateExpirationFormatted = format(data.dateExpiration, 'dd MMMM yyyy', { locale: fr })

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      // Header
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'IMAZ', style: 'logoText' },
              { text: "L'Immobilier de A à Z", style: 'logoSubtext' },
              { text: 'GIE HORONYA — Burkina Faso', style: 'logoSubtext2' },
            ],
          },
          {
            width: 'auto',
            stack: [
              { text: 'REÇU DE SOUSCRIPTION', style: 'receiptTitle' },
              { text: `N° ${data.numRecu}`, style: 'receiptNum' },
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 20],
      },
      // Divider
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#1A3A5C' }], margin: [0, 0, 0, 15] },
      // Date
      {
        text: `Date d'émission : ${dateFormatted}`,
        style: 'infoText',
        margin: [0, 0, 0, 20],
      },
      // Client info
      {
        style: 'sectionBox',
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                { text: 'INFORMATIONS DU SOUSCRIPTEUR', style: 'sectionTitle' },
                {
                  columns: [
                    {
                      width: '50%',
                      stack: [
                        { text: `Nom & Prénom : ${data.client.prenom} ${data.client.nom}`, style: 'fieldText' },
                        { text: `Téléphone : ${data.client.telephone}`, style: 'fieldText' },
                      ],
                    },
                    {
                      width: '50%',
                      stack: [
                        { text: `Email : ${data.client.email}`, style: 'fieldText' },
                        data.client.numIdentite ? { text: `Pièce d'identité : ${data.client.numIdentite}`, style: 'fieldText' } : {},
                      ],
                    },
                  ],
                },
              ],
              fillColor: '#F5F5F5',
              margin: [10, 10, 10, 10],
            },
          ]],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15],
      },
      // Product info
      {
        style: 'sectionBox',
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                { text: 'DÉTAILS DU BIEN', style: 'sectionTitle' },
                {
                  columns: [
                    {
                      width: '50%',
                      stack: [
                        { text: `Programme : ${data.programme.nom}`, style: 'fieldText' },
                        { text: `Ville : ${data.programme.ville}`, style: 'fieldText' },
                        { text: `Référence : ${data.produit.reference}`, style: 'fieldText' },
                      ],
                    },
                    {
                      width: '50%',
                      stack: [
                        { text: `Catégorie : ${getCategorieLabel(data.produit.categorie)}`, style: 'fieldText' },
                        { text: `Surface : ${data.produit.surface} m²`, style: 'fieldText' },
                        { text: `Nombre de pièces : ${data.produit.nbPieces}`, style: 'fieldText' },
                      ],
                    },
                  ],
                },
              ],
              fillColor: '#F5F5F5',
              margin: [10, 10, 10, 10],
            },
          ]],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15],
      },
      // Financial info
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Prix total du bien', style: 'tableLabel' },
              { text: `${data.produit.prixTotal.toLocaleString('fr-FR')} FCFA`, style: 'tableValue' },
            ],
            [
              { text: 'Frais de souscription (à payer en agence)', style: 'tableLabel', bold: true },
              { text: `${data.produit.fraisSouscription.toLocaleString('fr-FR')} FCFA`, style: 'tableValueHighlight' },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 0,
          hLineColor: () => '#E0E0E0',
        },
        margin: [0, 0, 0, 15],
      },
      // Important notice
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: [
                { text: 'IMPORTANT : ', bold: true, color: '#C0392B' },
                'Le paiement des frais de souscription doit être effectué en agence IMAZ dans un délai de ',
                { text: '30 jours', bold: true },
                `. Ce reçu est valide jusqu'au ${dateExpirationFormatted}.`,
              ],
              style: 'noticeText',
              fillColor: '#FFF8E1',
              margin: [10, 10, 10, 10],
            },
          ]],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20],
      },
      // QR Code and validity
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Validité du dossier', style: 'fieldLabel' },
              { text: `Du ${dateFormatted}`, style: 'fieldText' },
              { text: `Au ${dateExpirationFormatted}`, style: 'fieldText', color: '#C0392B' },
              { text: '\nContact Agence :', style: 'fieldLabel', margin: [0, 10, 0, 0] },
              { text: 'Tél : +226 XX XX XX XX', style: 'fieldText' },
              { text: 'Email : contact@imaz.bf', style: 'fieldText' },
              { text: 'Ouagadougou, Burkina Faso', style: 'fieldText' },
            ],
          },
          data.qrCodeDataUrl ? {
            width: 100,
            image: data.qrCodeDataUrl,
            height: 100,
            alignment: 'right',
          } : {
            width: 100,
            text: 'QR Code',
            alignment: 'center',
            color: '#CCCCCC',
          },
        ],
        margin: [0, 0, 0, 20],
      },
      // Divider
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }], margin: [0, 0, 0, 10] },
      // Footer
      {
        text: 'Ce document est généré automatiquement par le système IMAZ. Il ne constitue pas un contrat de vente définitif.',
        style: 'footerText',
        alignment: 'center',
      },
    ],
    styles: {
      logoText: { fontSize: 28, bold: true, color: '#1A3A5C' },
      logoSubtext: { fontSize: 11, color: '#1A3A5C', margin: [0, 2, 0, 0] },
      logoSubtext2: { fontSize: 10, color: '#666666' },
      receiptTitle: { fontSize: 16, bold: true, color: '#C0392B' },
      receiptNum: { fontSize: 12, color: '#1A3A5C', margin: [0, 4, 0, 0] },
      infoText: { fontSize: 10, color: '#666666' },
      sectionTitle: { fontSize: 12, bold: true, color: '#1A3A5C', margin: [0, 0, 0, 8] },
      fieldLabel: { fontSize: 10, bold: true, color: '#333333' },
      fieldText: { fontSize: 10, color: '#555555', margin: [0, 2, 0, 2] },
      tableLabel: { fontSize: 11, color: '#333333', margin: [5, 5, 5, 5] },
      tableValue: { fontSize: 11, color: '#333333', alignment: 'right', margin: [5, 5, 5, 5] },
      tableValueHighlight: { fontSize: 12, bold: true, color: '#1A3A5C', alignment: 'right', margin: [5, 5, 5, 5] },
      noticeText: { fontSize: 10, color: '#333333' },
      footerText: { fontSize: 8, color: '#999999' },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  }

  return new Promise((resolve, reject) => {
    const pdfDoc = pdfMakeInstance.createPdf(docDefinition)
    pdfDoc.getBuffer((buffer: Buffer) => {
      if (buffer) {
        resolve(buffer)
      } else {
        reject(new Error('Failed to generate PDF'))
      }
    })
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
  const auth = await requireBackofficeAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { type } = await request.json()

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'IMAZ Platform'
    workbook.created = new Date()

    if (type === 'souscriptions') {
      const souscriptions = await prisma.souscription.findMany({
        orderBy: { dateCreation: 'desc' },
        include: {
          client: true,
          produit: true,
          programme: true,
          paiements: true,
        },
      })

      const sheet = workbook.addWorksheet('Souscriptions')

      // Header row
      sheet.columns = [
        { header: 'N° Dossier', key: 'numRecu', width: 20 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Statut', key: 'statut', width: 12 },
        { header: 'Nom', key: 'nom', width: 18 },
        { header: 'Prénom', key: 'prenom', width: 18 },
        { header: 'Téléphone', key: 'telephone', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Programme', key: 'programme', width: 20 },
        { header: 'Référence', key: 'reference', width: 15 },
        { header: 'Catégorie', key: 'categorie', width: 15 },
        { header: 'Surface (m²)', key: 'surface', width: 12 },
        { header: 'Frais souscription', key: 'frais', width: 18 },
        { header: 'Montant payé', key: 'paye', width: 15 },
        { header: 'Expiration', key: 'expiration', width: 15 },
      ]

      // Style header
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1A3A5C' },
      }

      // Add data
      souscriptions.forEach((s) => {
        const totalPaid = s.paiements.reduce((sum, p) => sum + p.montant, 0)
        sheet.addRow({
          numRecu: s.numRecu,
          date: new Date(s.dateCreation).toLocaleDateString('fr-FR'),
          statut: s.statut,
          nom: s.client.nom,
          prenom: s.client.prenom,
          telephone: s.client.telephone,
          email: s.client.email,
          programme: s.programme.nom,
          reference: s.produit.reference,
          categorie: s.produit.categorie,
          surface: s.produit.surface,
          frais: s.produit.fraisSouscription,
          paye: totalPaid,
          expiration: new Date(s.dateExpiration).toLocaleDateString('fr-FR'),
        })
      })
    } else if (type === 'clients') {
      const clients = await prisma.client.findMany({
        orderBy: { dateCreation: 'desc' },
        select: {
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          ville: true,
          statut: true,
          dateCreation: true,
          _count: { select: { souscriptions: true } },
        },
      })

      const sheet = workbook.addWorksheet('Clients')
      sheet.columns = [
        { header: 'Nom', key: 'nom', width: 18 },
        { header: 'Prénom', key: 'prenom', width: 18 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Téléphone', key: 'telephone', width: 15 },
        { header: 'Ville', key: 'ville', width: 15 },
        { header: 'Statut', key: 'statut', width: 12 },
        { header: 'Souscriptions', key: 'souscriptions', width: 14 },
        { header: "Date d'inscription", key: 'dateCreation', width: 18 },
      ]

      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1A3A5C' },
      }

      clients.forEach((c) => {
        sheet.addRow({
          nom: c.nom,
          prenom: c.prenom,
          email: c.email,
          telephone: c.telephone,
          ville: c.ville || '',
          statut: c.statut,
          souscriptions: c._count.souscriptions,
          dateCreation: new Date(c.dateCreation).toLocaleDateString('fr-FR'),
        })
      })
    }

    await createAuditLog({
      utilisateurId: auth.id,
      action: AUDIT_ACTIONS.EXPORT_EXCEL,
      details: { type },
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${type}-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Erreur export' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { programmeSchema } from '@/lib/validation'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireBackofficeAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const programme = await prisma.programme.findUnique({
      where: { id: params.id },
      include: { produits: true, _count: { select: { souscriptions: true } } },
    })
    if (!programme) return NextResponse.json({ error: 'Programme introuvable' }, { status: 404 })
    return NextResponse.json({ programme })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN', 'RESPONSABLE_PROGRAMME'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const validation = programmeSchema.partial().safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const programme = await prisma.programme.update({
      where: { id: params.id },
      data: {
        ...validation.data,
        dateOuverture: validation.data.dateOuverture ? new Date(validation.data.dateOuverture) : undefined,
        dateCloture: validation.data.dateCloture ? new Date(validation.data.dateCloture) : undefined,
      },
    })

    await createAuditLog({
      utilisateurId: auth.id,
      action: AUDIT_ACTIONS.PROGRAMME_UPDATED,
      details: { programmeId: programme.id },
    })

    return NextResponse.json({ programme })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

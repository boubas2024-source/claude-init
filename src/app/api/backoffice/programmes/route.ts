import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { programmeSchema } from '@/lib/validation'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const auth = await requireBackofficeAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const programmes = await prisma.programme.findMany({
      orderBy: { nom: 'asc' },
      include: {
        _count: { select: { produits: true, souscriptions: true } },
      },
    })
    return NextResponse.json({ programmes })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN', 'RESPONSABLE_PROGRAMME'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const validation = programmeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides', details: validation.error.flatten() }, { status: 400 })
    }

    const programme = await prisma.programme.create({
      data: {
        ...validation.data,
        dateOuverture: validation.data.dateOuverture ? new Date(validation.data.dateOuverture) : null,
        dateCloture: validation.data.dateCloture ? new Date(validation.data.dateCloture) : null,
      },
    })

    await createAuditLog({
      utilisateurId: auth.id,
      action: AUDIT_ACTIONS.PROGRAMME_CREATED,
      details: { programmeId: programme.id, nom: programme.nom },
    })

    return NextResponse.json({ programme }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

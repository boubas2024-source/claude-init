import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { utilisateurBOSchema } from '@/lib/validation'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const utilisateurs = await prisma.utilisateurBO.findMany({
      orderBy: { dateCreation: 'desc' },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        statut: true,
        programmesAssignes: true,
        twoFactorEnabled: true,
        dateCreation: true,
      },
    })
    return NextResponse.json({ utilisateurs })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const validation = utilisateurBOSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides', details: validation.error.flatten() }, { status: 400 })
    }

    const existing = await prisma.utilisateurBO.findUnique({
      where: { email: validation.data.email },
    })
    if (existing) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(validation.data.motDePasse, 12)

    const utilisateur = await prisma.utilisateurBO.create({
      data: {
        ...validation.data,
        motDePasse: hashedPassword,
        programmesAssignes: validation.data.programmesAssignes || [],
      },
      select: { id: true, nom: true, email: true, role: true },
    })

    await createAuditLog({
      utilisateurId: auth.id,
      action: AUDIT_ACTIONS.BO_USER_CREATED,
      details: { createdId: utilisateur.id, email: utilisateur.email },
    })

    return NextResponse.json({ utilisateur }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

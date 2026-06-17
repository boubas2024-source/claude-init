import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validation'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { getClientIP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check if email or phone already exists
    const existing = await prisma.client.findFirst({
      where: {
        OR: [{ email: data.email }, { telephone: data.telephone }],
      },
    })

    if (existing) {
      if (existing.email === data.email) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Ce numéro de téléphone est déjà utilisé' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(data.motDePasse, 12)

    const client = await prisma.client.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        telephoneSecondaire: data.telephoneSecondaire,
        motDePasse: hashedPassword,
        dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : null,
        lieuNaissance: data.lieuNaissance,
        nationalite: data.nationalite,
        numIdentite: data.numIdentite,
        adresse: data.adresse,
        secteur: data.secteur,
        ville: data.ville,
        province: data.province,
        profession: data.profession,
        sourceFinancement: data.sourceFinancement,
      },
      select: { id: true, nom: true, prenom: true, email: true },
    })

    await createAuditLog({
      action: AUDIT_ACTIONS.CLIENT_REGISTER,
      details: { clientId: client.id, email: data.email },
      ip: getClientIP(request),
    })

    return NextResponse.json(
      { message: 'Compte créé avec succès', client },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

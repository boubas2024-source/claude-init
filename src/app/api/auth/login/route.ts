import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validation'
import { signToken, setClientCookie, getClientIP } from '@/lib/auth'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const { email, motDePasse } = validation.data

    const client = await prisma.client.findUnique({
      where: { email },
    })

    if (!client || !(await bcrypt.compare(motDePasse, client.motDePasse))) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    if (client.statut === 'SUSPENDU') {
      return NextResponse.json({ error: 'Votre compte est suspendu' }, { status: 403 })
    }

    const token = await signToken({
      id: client.id,
      email: client.email,
      type: 'client',
    })

    await createAuditLog({
      action: AUDIT_ACTIONS.CLIENT_LOGIN,
      details: { clientId: client.id },
      ip: getClientIP(request),
    })

    const response = NextResponse.json({
      message: 'Connexion réussie',
      client: {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
      },
    })

    setClientCookie(response, token)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

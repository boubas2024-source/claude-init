import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setBackofficeCookie, getClientIP } from '@/lib/auth'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const { email, motDePasse } = await request.json()

    if (!email || !motDePasse) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const utilisateur = await prisma.utilisateurBO.findUnique({
      where: { email },
    })

    if (!utilisateur || !(await bcrypt.compare(motDePasse, utilisateur.motDePasse))) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    if (utilisateur.statut === 'INACTIF') {
      return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 })
    }

    // If 2FA enabled, return temp token
    if (utilisateur.twoFactorEnabled) {
      const tempToken = await signToken(
        { id: utilisateur.id, email: utilisateur.email, type: 'backoffice', role: utilisateur.role },
        '5m' // Temp token valid 5 minutes
      )
      return NextResponse.json({ requires2FA: true, tempToken })
    }

    // No 2FA, set full session
    const token = await signToken({
      id: utilisateur.id,
      email: utilisateur.email,
      type: 'backoffice',
      role: utilisateur.role,
    })

    await createAuditLog({
      utilisateurId: utilisateur.id,
      action: AUDIT_ACTIONS.BO_LOGIN,
      ip: getClientIP(request),
    })

    const response = NextResponse.json({
      message: 'Connexion réussie',
      user: { id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role },
    })

    setBackofficeCookie(response, token)
    return response
  } catch (error) {
    console.error('BO login error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

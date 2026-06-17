import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import { prisma } from '@/lib/prisma'
import { verifyToken, signToken, setBackofficeCookie, getClientIP } from '@/lib/auth'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const { code, tempToken } = await request.json()

    if (!code || !tempToken) {
      return NextResponse.json({ error: 'Code et token requis' }, { status: 400 })
    }

    const payload = await verifyToken(tempToken)
    if (!payload || payload.type !== 'backoffice') {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 })
    }

    const utilisateur = await prisma.utilisateurBO.findUnique({
      where: { id: payload.id },
    })

    if (!utilisateur || !utilisateur.twoFactorSecret) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const verified = speakeasy.totp.verify({
      secret: utilisateur.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    })

    if (!verified) {
      return NextResponse.json({ error: 'Code 2FA invalide' }, { status: 401 })
    }

    const sessionToken = await signToken({
      id: utilisateur.id,
      email: utilisateur.email,
      type: 'backoffice',
      role: utilisateur.role,
    })

    await createAuditLog({
      utilisateurId: utilisateur.id,
      action: AUDIT_ACTIONS.BO_2FA_VERIFIED,
      ip: getClientIP(request),
    })

    const response = NextResponse.json({
      message: 'Connexion réussie',
      user: { id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role },
    })

    setBackofficeCookie(response, sessionToken)
    return response
  } catch (error) {
    console.error('2FA verify error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

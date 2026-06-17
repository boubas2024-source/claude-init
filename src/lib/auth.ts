import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

export type JWTPayload = {
  id: string
  email: string
  type: 'client' | 'backoffice'
  role?: string
}

export async function signToken(payload: JWTPayload, expiresIn = '7d'): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getClientSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('client_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getBackofficeSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('bo_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function setClientCookie(response: NextResponse, token: string): void {
  response.cookies.set('client_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export function setBackofficeCookie(response: NextResponse, token: string): void {
  response.cookies.set('bo_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
}

export function clearClientCookie(response: NextResponse): void {
  response.cookies.delete('client_token')
}

export function clearBackofficeCookie(response: NextResponse): void {
  response.cookies.delete('bo_token')
}

export async function requireClientAuth(request: NextRequest): Promise<JWTPayload | NextResponse> {
  const token = request.cookies.get('client_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  const payload = await verifyToken(token)
  if (!payload || payload.type !== 'client') {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
  }
  return payload
}

export async function requireBackofficeAuth(
  request: NextRequest,
  roles?: string[]
): Promise<JWTPayload | NextResponse> {
  const token = request.cookies.get('bo_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  const payload = await verifyToken(token)
  if (!payload || payload.type !== 'backoffice') {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
  }
  if (roles && payload.role && !roles.includes(payload.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }
  return payload
}

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

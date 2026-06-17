import { NextRequest, NextResponse } from 'next/server'
import { requireClientAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (auth instanceof NextResponse) return auth

  const client = await prisma.client.findUnique({
    where: { id: auth.id },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      adresse: true,
      ville: true,
      province: true,
      profession: true,
      numIdentite: true,
      dateCreation: true,
    },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
  }

  return NextResponse.json({ client })
}

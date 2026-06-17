import { NextRequest, NextResponse } from 'next/server'
import { requireBackofficeAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = await requireBackofficeAuth(request, ['SUPER_ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = 50

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { dateAction: 'desc' },
        include: {
          utilisateur: { select: { nom: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count(),
    ])

    return NextResponse.json({ logs, total, page, perPage })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

import { prisma } from './prisma'

interface AuditLogParams {
  utilisateurId?: string
  action: string
  details?: Record<string, unknown>
  ip?: string
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        utilisateurId: params.utilisateurId,
        action: params.action,
        details: params.details ? JSON.parse(JSON.stringify(params.details)) : undefined,
        ip: params.ip,
      },
    })
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Audit log error:', error)
  }
}

export const AUDIT_ACTIONS = {
  // Auth
  CLIENT_LOGIN: 'CLIENT_LOGIN',
  CLIENT_LOGOUT: 'CLIENT_LOGOUT',
  CLIENT_REGISTER: 'CLIENT_REGISTER',
  BO_LOGIN: 'BO_LOGIN',
  BO_LOGOUT: 'BO_LOGOUT',
  BO_2FA_VERIFIED: 'BO_2FA_VERIFIED',
  // Souscriptions
  SOUSCRIPTION_CREATED: 'SOUSCRIPTION_CREATED',
  SOUSCRIPTION_CANCELLED: 'SOUSCRIPTION_CANCELLED',
  SOUSCRIPTION_VALIDATED: 'SOUSCRIPTION_VALIDATED',
  // Paiements
  PAIEMENT_CREATED: 'PAIEMENT_CREATED',
  // Products
  PRODUIT_CREATED: 'PRODUIT_CREATED',
  PRODUIT_UPDATED: 'PRODUIT_UPDATED',
  PRODUIT_DELETED: 'PRODUIT_DELETED',
  // Programmes
  PROGRAMME_CREATED: 'PROGRAMME_CREATED',
  PROGRAMME_UPDATED: 'PROGRAMME_UPDATED',
  // Users
  BO_USER_CREATED: 'BO_USER_CREATED',
  BO_USER_UPDATED: 'BO_USER_UPDATED',
  BO_USER_DELETED: 'BO_USER_DELETED',
  // Exports
  EXPORT_EXCEL: 'EXPORT_EXCEL',
  EXPORT_PDF: 'EXPORT_PDF',
} as const

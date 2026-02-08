import { prisma } from './prisma';

export interface AuditLogInput {
  workspaceId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(input: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      oldData: input.oldData as any,
      newData: input.newData as any,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}

export async function getAuditLogs(
  workspaceId: string,
  options?: {
    userId?: string;
    action?: string;
    entity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
) {
  const where: Record<string, unknown> = { workspaceId };

  if (options?.userId) where.userId = options.userId;
  if (options?.action) where.action = options.action;
  if (options?.entity) where.entity = options.entity;
  if (options?.startDate || options?.endDate) {
    where.createdAt = {};
    if (options?.startDate) (where.createdAt as Record<string, Date>).gte = options.startDate;
    if (options?.endDate) (where.createdAt as Record<string, Date>).lte = options.endDate;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 100,
    skip: options?.offset ?? 0,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
}

export const AuditActions = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  IMPORT: 'import',
  EXPORT: 'export',
  INVITE: 'invite',
  REMOVE_MEMBER: 'remove_member',
  CHANGE_ROLE: 'change_role',
  START_CAMPAIGN: 'start_campaign',
  PAUSE_CAMPAIGN: 'pause_campaign',
  VERIFY_EMAIL: 'verify_email',
  ENRICH_LEAD: 'enrich_lead',
  SEND_EMAIL: 'send_email',
  LOGIN: 'login',
  LOGOUT: 'logout',
} as const;

export const AuditEntities = {
  USER: 'user',
  WORKSPACE: 'workspace',
  LEAD: 'lead',
  COMPANY: 'company',
  LIST: 'list',
  SEQUENCE: 'sequence',
  CAMPAIGN: 'campaign',
  SENDING_ACCOUNT: 'sending_account',
  INTEGRATION: 'integration',
  WEBHOOK: 'webhook',
  SUBSCRIPTION: 'subscription',
} as const;

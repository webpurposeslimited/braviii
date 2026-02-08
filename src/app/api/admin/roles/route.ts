import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, isAdminContext } from '@/lib/admin-guard';
import { successResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const guard = await requirePermission('users.read');
  if (!isAdminContext(guard)) return guard;

  const roles = await (prisma as any).adminRole.findMany({
    include: {
      permissions: {
        include: { permission: true },
      },
      _count: { select: { users: true } },
    },
    orderBy: { name: 'asc' },
  });

  const permissions = await (prisma as any).permission.findMany({
    orderBy: [{ group: 'asc' }, { code: 'asc' }],
  });

  return successResponse({ roles, permissions });
}

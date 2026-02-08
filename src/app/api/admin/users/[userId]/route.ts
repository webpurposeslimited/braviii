import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requirePermission, isAdminContext } from '@/lib/admin-guard';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';

const updateAdminUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  adminRoleIds: z.array(z.string()).optional(),
  disabled: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const guard = await requirePermission('users.write');
  if (!isAdminContext(guard)) return guard;

  try {
    const body = await request.json();
    const data = updateAdminUserSchema.parse(body);
    const targetUser = await prisma.user.findUnique({ where: { id: params.userId } });

    if (!targetUser) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'User not found', 404);
    }

    // Prevent non-super-admins from editing super admins
    if (targetUser.isSuperAdmin && !guard.isSuperAdmin) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Cannot edit super admin', 403);
    }

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;

    // Update roles if provided
    if (data.adminRoleIds !== undefined) {
      // Remove existing roles
      await (prisma as any).userAdminRole.deleteMany({
        where: { userId: params.userId },
      });

      // Add new roles
      if (data.adminRoleIds.length > 0) {
        await (prisma as any).userAdminRole.createMany({
          data: data.adminRoleIds.map((roleId: string) => ({
            userId: params.userId,
            adminRoleId: roleId,
          })),
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id: params.userId },
      data: updateData as any,
      select: {
        id: true,
        name: true,
        email: true,
        isSuperAdmin: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      userId: guard.userId,
      action: 'update',
      entity: 'admin_user',
      entityId: params.userId,
      newData: data,
    });

    return successResponse(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Update admin user error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update user', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const guard = await requirePermission('users.delete');
  if (!isAdminContext(guard)) return guard;

  const targetUser = await prisma.user.findUnique({ where: { id: params.userId } });

  if (!targetUser) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'User not found', 404);
  }

  if (targetUser.isSuperAdmin) {
    return errorResponse(ErrorCodes.FORBIDDEN, 'Cannot delete super admin', 403);
  }

  if (params.userId === guard.userId) {
    return errorResponse(ErrorCodes.FORBIDDEN, 'Cannot delete yourself', 403);
  }

  // Remove admin roles instead of deleting user entirely
  await (prisma as any).userAdminRole.deleteMany({
    where: { userId: params.userId },
  });

  await createAuditLog({
    userId: guard.userId,
    action: 'delete',
    entity: 'admin_user',
    entityId: params.userId,
  });

  return successResponse({ success: true });
}

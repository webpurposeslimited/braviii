import { NextRequest } from 'next/server';
import { auth } from './auth';
import { prisma } from './prisma';
import { hasPermission, isAdminUser, type PermissionCode } from './permissions';
import { errorResponse, ErrorCodes } from './api-response';

export interface AdminContext {
  userId: string;
  isSuperAdmin: boolean;
}

/**
 * Validates that the current request is from an authenticated admin user.
 * Returns the admin context or a NextResponse error.
 */
export async function requireAdmin(
  request?: NextRequest
): Promise<AdminContext | ReturnType<typeof errorResponse>> {
  const session = await auth();

  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (!user) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'User not found', 401);
  }

  const admin = await isAdminUser(userId);
  if (!admin) {
    return errorResponse(ErrorCodes.FORBIDDEN, 'Admin access required', 403);
  }

  return { userId, isSuperAdmin: user.isSuperAdmin };
}

/**
 * Validates that the current user has a specific permission.
 */
export async function requirePermission(
  permission: PermissionCode
): Promise<AdminContext | ReturnType<typeof errorResponse>> {
  const session = await auth();

  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });

  if (!user) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'User not found', 401);
  }

  const allowed = await hasPermission(userId, permission);
  if (!allowed) {
    return errorResponse(
      ErrorCodes.FORBIDDEN,
      `Missing permission: ${permission}`,
      403
    );
  }

  return { userId, isSuperAdmin: user.isSuperAdmin };
}

/**
 * Helper to check if the result is an error response (NextResponse) or valid context.
 */
export function isAdminContext(
  result: AdminContext | ReturnType<typeof errorResponse>
): result is AdminContext {
  return 'userId' in result;
}

/**
 * Gets the current authenticated user ID from session.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

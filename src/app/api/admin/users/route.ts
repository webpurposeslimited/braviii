import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requirePermission, isAdminContext } from '@/lib/admin-guard';
import { successResponse, errorResponse, ErrorCodes, paginatedResponse } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';

const createAdminUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  adminRoleIds: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  const guard = await requirePermission('users.read');
  if (!isAdminContext(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const search = searchParams.get('search');

  const where: Record<string, unknown> = {
    OR: [
      { isSuperAdmin: true },
      { adminRoles: { some: {} } },
    ],
  };

  if (search) {
    where.AND = [
      {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isSuperAdmin: true,
        createdAt: true,
        updatedAt: true,
        adminRoles: {
          include: {
            adminRole: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.user.count({ where: where as any }),
  ]);

  return paginatedResponse(users, page, limit, total);
}

export async function POST(request: NextRequest) {
  const guard = await requirePermission('users.write');
  if (!isAdminContext(guard)) return guard;

  try {
    const body = await request.json();
    const data = createAdminUserSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return errorResponse(ErrorCodes.CONFLICT, 'User with this email already exists', 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        emailVerified: new Date(),
        adminRoles: data.adminRoleIds?.length
          ? {
              create: data.adminRoleIds.map((roleId) => ({
                adminRoleId: roleId,
              })),
            }
          : undefined,
      } as any,
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
      action: 'create',
      entity: 'admin_user',
      entityId: user.id,
      newData: { name: data.name, email: data.email },
    });

    return successResponse(user, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Create admin user error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create user', 500);
  }
}

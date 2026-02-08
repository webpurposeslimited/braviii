import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401) };
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isSuperAdmin) {
    return { error: errorResponse(ErrorCodes.FORBIDDEN, 'Admin access required', 403) };
  }
  return { user };
}

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireSuperAdmin();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          isSuperAdmin: true,
          createdAt: true,
          workspaceMembers: {
            include: {
              workspace: {
                select: {
                  id: true,
                  name: true,
                  subscription: {
                    select: { plan: true, status: true },
                  },
                  _count: { select: { leads: true, members: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const clients = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      isSuperAdmin: u.isSuperAdmin,
      createdAt: u.createdAt,
      workspaces: u.workspaceMembers.map((wm) => ({
        id: wm.workspace.id,
        name: wm.workspace.name,
        role: wm.role,
        plan: wm.workspace.subscription?.plan || 'FREE',
        status: wm.workspace.subscription?.status || 'ACTIVE',
        leadsCount: wm.workspace._count.leads,
        membersCount: wm.workspace._count.members,
      })),
    }));

    return successResponse({ clients, total, page, limit });
  } catch (err) {
    console.error('Get clients error:', err);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch clients', 500);
  }
}

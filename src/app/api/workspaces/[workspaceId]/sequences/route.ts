import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/workspace';
import { successResponse, errorResponse, paginatedResponse, ErrorCodes } from '@/lib/api-response';

const createSequenceSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { hasAccess } = await checkWorkspaceAccess(params.workspaceId, session.user.id);
    if (!hasAccess) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { workspaceId: params.workspaceId };
    if (status) where.status = status;

    const [sequences, total] = await Promise.all([
      prisma.sequence.findMany({
        where,
        include: {
          steps: { orderBy: { order: 'asc' } },
          campaigns: {
            select: {
              id: true,
              name: true,
              status: true,
              totalLeads: true,
              sent: true,
              opened: true,
              replied: true,
              bounced: true,
            },
          },
          _count: { select: { steps: true, campaigns: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sequence.count({ where }),
    ]);

    return paginatedResponse(sequences, page, limit, total);
  } catch (error) {
    console.error('Get sequences error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch sequences', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { hasAccess, role } = await checkWorkspaceAccess(params.workspaceId, session.user.id);
    if (!hasAccess) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }
    if (role === 'VIEWER') {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Viewers cannot create sequences', 403);
    }

    const body = await request.json();
    const data = createSequenceSchema.parse(body);

    const sequence = await prisma.sequence.create({
      data: {
        workspaceId: params.workspaceId,
        name: data.name,
        description: data.description,
        status: 'DRAFT',
      },
      include: {
        steps: true,
        _count: { select: { steps: true, campaigns: true } },
      },
    });

    return successResponse(sequence, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Create sequence error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create sequence', 500);
  }
}

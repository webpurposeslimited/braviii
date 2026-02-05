import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/workspace';
import { successResponse, errorResponse, paginatedResponse, ErrorCodes } from '@/lib/api-response';

const createLeadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  jobTitle: z.string().max(200).optional(),
  linkedinUrl: z.string().url().optional(),
  companyId: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'ENGAGED', 'QUALIFIED', 'CONVERTED', 'UNQUALIFIED']).optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const listId = searchParams.get('listId');

    const where: Record<string, unknown> = {
      workspaceId: params.workspaceId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (listId) {
      where.lists = {
        some: { listId },
      };
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
          emailVerification: {
            select: {
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return paginatedResponse(leads, { page, limit, total });
  } catch (error) {
    console.error('Get leads error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch leads', 500);
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
      return errorResponse(ErrorCodes.FORBIDDEN, 'Viewers cannot create leads', 403);
    }

    const body = await request.json();
    const data = createLeadSchema.parse(body);

    if (data.email) {
      const existing = await prisma.lead.findFirst({
        where: {
          workspaceId: params.workspaceId,
          email: data.email,
        },
      });

      if (existing) {
        return errorResponse(
          ErrorCodes.CONFLICT,
          'A lead with this email already exists',
          409
        );
      }
    }

    const lead = await prisma.lead.create({
      data: {
        workspaceId: params.workspaceId,
        ...data,
      },
      include: {
        company: true,
      },
    });

    return successResponse(lead, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input data',
        400,
        error.errors
      );
    }

    console.error('Create lead error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create lead', 500);
  }
}

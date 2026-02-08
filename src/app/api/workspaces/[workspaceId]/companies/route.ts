import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, paginatedResponse, ErrorCodes } from '@/lib/api-response';

const createCompanySchema = z.object({
  name: z.string().min(1).max(200),
  domain: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
});

async function verifyWorkspaceAccess(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  return !!member;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { workspaceId } = params;
    if (!(await verifyWorkspaceAccess(workspaceId, session.user.id))) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '25'), 100);
    const search = url.searchParams.get('search') || '';
    const industry = url.searchParams.get('industry') || '';

    const where: any = { workspaceId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (industry) {
      where.industry = industry;
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: { _count: { select: { leads: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);

    return paginatedResponse(companies, page, limit, total);
  } catch (error) {
    console.error('Get companies error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch companies', 500);
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

    const { workspaceId } = params;
    if (!(await verifyWorkspaceAccess(workspaceId, session.user.id))) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    const body = await request.json();
    const data = createCompanySchema.parse(body);

    // Check for duplicate domain in workspace
    if (data.domain) {
      const existing = await prisma.company.findUnique({
        where: { workspaceId_domain: { workspaceId, domain: data.domain } },
      });
      if (existing) {
        return errorResponse(ErrorCodes.CONFLICT, 'A company with this domain already exists', 409);
      }
    }

    const company = await prisma.company.create({
      data: {
        ...data,
        linkedinUrl: data.linkedinUrl || null,
        website: data.website || null,
        workspaceId,
      },
      include: { _count: { select: { leads: true } } },
    });

    return successResponse(company, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Create company error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create company', 500);
  }
}

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

const updateCompanySchema = z.object({
  name: z.string().min(1).max(200).optional(),
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
  _request: NextRequest,
  { params }: { params: { workspaceId: string; companyId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { workspaceId, companyId } = params;
    if (!(await verifyWorkspaceAccess(workspaceId, session.user.id))) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    const company = await prisma.company.findFirst({
      where: { id: companyId, workspaceId },
      include: {
        _count: { select: { leads: true } },
        leads: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            status: true,
          },
        },
      },
    });

    if (!company) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Company not found', 404);
    }

    return successResponse(company);
  } catch (error) {
    console.error('Get company error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch company', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { workspaceId: string; companyId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { workspaceId, companyId } = params;
    if (!(await verifyWorkspaceAccess(workspaceId, session.user.id))) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    const existing = await prisma.company.findFirst({
      where: { id: companyId, workspaceId },
    });
    if (!existing) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Company not found', 404);
    }

    const body = await request.json();
    const data = updateCompanySchema.parse(body);

    // Check domain uniqueness if changed
    if (data.domain && data.domain !== existing.domain) {
      const dup = await prisma.company.findFirst({
        where: { workspaceId, domain: data.domain, NOT: { id: companyId } },
      });
      if (dup) {
        return errorResponse(ErrorCodes.CONFLICT, 'A company with this domain already exists', 409);
      }
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...data,
        linkedinUrl: data.linkedinUrl === '' ? null : data.linkedinUrl,
        website: data.website === '' ? null : data.website,
      },
      include: { _count: { select: { leads: true } } },
    });

    return successResponse(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Update company error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update company', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { workspaceId: string; companyId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { workspaceId, companyId } = params;
    if (!(await verifyWorkspaceAccess(workspaceId, session.user.id))) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    const existing = await prisma.company.findFirst({
      where: { id: companyId, workspaceId },
    });
    if (!existing) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Company not found', 404);
    }

    // Unlink leads first, then delete
    await prisma.lead.updateMany({
      where: { companyId },
      data: { companyId: null },
    });

    await prisma.company.delete({ where: { id: companyId } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Delete company error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to delete company', 500);
  }
}

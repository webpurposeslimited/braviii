import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/workspace';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

const updateLeadSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  jobTitle: z.string().max(200).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().max(200).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'ENGAGED', 'QUALIFIED', 'CONVERTED', 'UNQUALIFIED', 'DO_NOT_CONTACT']).optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string; leadId: string } }
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

    const lead = await prisma.lead.findFirst({
      where: { id: params.leadId, workspaceId: params.workspaceId },
      include: { company: { select: { id: true, name: true, domain: true } } },
    });

    if (!lead) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Lead not found', 404);
    }

    return successResponse(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch lead', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { workspaceId: string; leadId: string } }
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
      return errorResponse(ErrorCodes.FORBIDDEN, 'Viewers cannot edit leads', 403);
    }

    const existing = await prisma.lead.findFirst({
      where: { id: params.leadId, workspaceId: params.workspaceId },
    });
    if (!existing) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Lead not found', 404);
    }

    const body = await request.json();
    const data = updateLeadSchema.parse(body);

    const lead = await prisma.lead.update({
      where: { id: params.leadId },
      data,
      include: { company: { select: { id: true, name: true, domain: true } } },
    });

    return successResponse(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Update lead error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update lead', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string; leadId: string } }
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
      return errorResponse(ErrorCodes.FORBIDDEN, 'Viewers cannot delete leads', 403);
    }

    const existing = await prisma.lead.findFirst({
      where: { id: params.leadId, workspaceId: params.workspaceId },
    });
    if (!existing) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Lead not found', 404);
    }

    await prisma.lead.delete({ where: { id: params.leadId } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Delete lead error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to delete lead', 500);
  }
}

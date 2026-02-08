import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/workspace';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

const updateSequenceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string; sequenceId: string } }
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

    const sequence = await prisma.sequence.findFirst({
      where: { id: params.sequenceId, workspaceId: params.workspaceId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        campaigns: {
          include: { _count: { select: { sends: true } } },
        },
      },
    });

    if (!sequence) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Sequence not found', 404);
    }

    return successResponse(sequence);
  } catch (error) {
    console.error('Get sequence error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch sequence', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { workspaceId: string; sequenceId: string } }
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
      return errorResponse(ErrorCodes.FORBIDDEN, 'Viewers cannot edit sequences', 403);
    }

    const existing = await prisma.sequence.findFirst({
      where: { id: params.sequenceId, workspaceId: params.workspaceId },
    });
    if (!existing) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Sequence not found', 404);
    }

    const body = await request.json();
    const data = updateSequenceSchema.parse(body);

    const sequence = await prisma.sequence.update({
      where: { id: params.sequenceId },
      data,
      include: {
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { steps: true, campaigns: true } },
      },
    });

    return successResponse(sequence);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Update sequence error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update sequence', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string; sequenceId: string } }
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
      return errorResponse(ErrorCodes.FORBIDDEN, 'Viewers cannot delete sequences', 403);
    }

    const existing = await prisma.sequence.findFirst({
      where: { id: params.sequenceId, workspaceId: params.workspaceId },
    });
    if (!existing) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Sequence not found', 404);
    }

    await prisma.sequence.delete({ where: { id: params.sequenceId } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Delete sequence error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to delete sequence', 500);
  }
}

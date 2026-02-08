import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/workspace';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string; memberId: string } }
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
    if (role !== 'OWNER' && role !== 'ADMIN') {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Only owners and admins can remove members', 403);
    }

    const member = await prisma.workspaceMember.findFirst({
      where: { id: params.memberId, workspaceId: params.workspaceId },
    });

    if (!member) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Member not found', 404);
    }

    if (member.role === 'OWNER') {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Cannot remove workspace owner', 403);
    }

    await prisma.workspaceMember.delete({ where: { id: params.memberId } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to remove member', 500);
  }
}

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/workspace';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

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

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: params.workspaceId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const invites = await prisma.invite.findMany({
      where: { workspaceId: params.workspaceId, status: 'PENDING' },
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ members, invites });
  } catch (error) {
    console.error('Get members error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch members', 500);
  }
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

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
    if (role !== 'OWNER' && role !== 'ADMIN') {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Only owners and admins can invite members', 403);
    }

    const body = await request.json();
    const data = inviteSchema.parse(body);

    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        user: { email: data.email },
      },
    });
    if (existingMember) {
      return errorResponse(ErrorCodes.CONFLICT, 'User is already a member', 409);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      const member = await prisma.workspaceMember.create({
        data: {
          workspaceId: params.workspaceId,
          userId: existingUser.id,
          role: data.role as any,
        },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });
      return successResponse(member, undefined, 201);
    }

    const token = crypto.randomUUID();
    const invite = await prisma.invite.create({
      data: {
        workspaceId: params.workspaceId,
        email: data.email,
        role: data.role as any,
        token,
        invitedById: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return successResponse(invite, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Invite member error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to invite member', 500);
  }
}

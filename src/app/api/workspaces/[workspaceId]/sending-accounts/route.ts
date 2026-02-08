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

    const accounts = await prisma.sendingAccount.findMany({
      where: { workspaceId: params.workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        status: true,
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        dailyLimit: true,
        sentToday: true,
        bounceRate: true,
        replyRate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(accounts);
  } catch (error) {
    console.error('Get sending accounts error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch sending accounts', 500);
  }
}

const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  smtpHost: z.string().min(1),
  smtpPort: z.number().int().min(1).max(65535),
  smtpUser: z.string().min(1),
  smtpPass: z.string().min(1),
  dailyLimit: z.number().int().min(1).max(10000).default(50),
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
    if (role === 'VIEWER') {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Viewers cannot add sending accounts', 403);
    }

    const body = await request.json();
    const data = createAccountSchema.parse(body);

    const account = await prisma.sendingAccount.create({
      data: {
        workspaceId: params.workspaceId,
        name: data.name,
        email: data.email,
        type: 'SMTP',
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser,
        smtpPass: data.smtpPass,
        dailyLimit: data.dailyLimit,
      },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        status: true,
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        dailyLimit: true,
        createdAt: true,
      },
    });

    return successResponse(account, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Create sending account error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create sending account', 500);
  }
}

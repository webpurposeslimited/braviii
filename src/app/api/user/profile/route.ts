import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch profile', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.avatar !== undefined && { avatar: data.avatar || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Update profile error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update profile', 500);
  }
}

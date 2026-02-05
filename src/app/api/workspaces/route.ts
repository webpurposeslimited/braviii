import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createWorkspace, getUserWorkspaces } from '@/lib/workspace';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { slugify } from '@/lib/utils';

const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const workspaces = await getUserWorkspaces(session.user.id);

    return successResponse(workspaces);
  } catch (error) {
    console.error('Get workspaces error:', error);
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch workspaces',
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const body = await request.json();
    const data = createWorkspaceSchema.parse(body);

    let slug = slugify(data.name);
    let slugExists = await prisma.workspace.findUnique({
      where: { slug },
    });

    let counter = 1;
    while (slugExists) {
      slug = `${slugify(data.name)}-${counter}`;
      slugExists = await prisma.workspace.findUnique({
        where: { slug },
      });
      counter++;
    }

    const workspace = await createWorkspace(data.name, slug, session.user.id);

    return successResponse(workspace, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input data',
        400,
        error.errors
      );
    }

    console.error('Create workspace error:', error);
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to create workspace',
      500
    );
  }
}

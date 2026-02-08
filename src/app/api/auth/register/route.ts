import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { createWorkspace } from '@/lib/workspace';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { slugify } from '@/lib/utils';
import { validateBusinessEmail } from '@/lib/business-email';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  workspaceName: z.string().min(2).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Business email validation
    const emailCheck = validateBusinessEmail(data.email);
    if (!emailCheck.valid) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        emailCheck.reason || 'Business email required',
        400
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return errorResponse(
        ErrorCodes.CONFLICT,
        'A user with this email already exists',
        409
      );
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
    });

    if (data.workspaceName) {
      let slug = slugify(data.workspaceName);
      let slugExists = await prisma.workspace.findUnique({
        where: { slug },
      });

      let counter = 1;
      while (slugExists) {
        slug = `${slugify(data.workspaceName)}-${counter}`;
        slugExists = await prisma.workspace.findUnique({
          where: { slug },
        });
        counter++;
      }

      await createWorkspace(data.workspaceName, slug, user.id);
    }

    return successResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      undefined,
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input data',
        400,
        error.errors
      );
    }

    console.error('Registration error:', error);
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to create account',
      500
    );
  }
}

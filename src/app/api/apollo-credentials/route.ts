import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { encrypt } from '@/lib/encryption';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

const saveCredentialSchema = z.object({
  apiKey: z.string().min(10),
  label: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
  }

  const credential = await (prisma as any).apolloCredential.findFirst({
    where: { ownerType: 'USER', ownerId: session.user.id },
    select: { id: true, label: true, isDefault: true, createdAt: true, updatedAt: true },
  });

  return successResponse({ credential, hasKey: !!credential });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
  }

  try {
    const body = await request.json();
    const data = saveCredentialSchema.parse(body);

    const encrypted = encrypt(data.apiKey);

    // Upsert user-level credential
    const existing = await (prisma as any).apolloCredential.findFirst({
      where: { ownerType: 'USER', ownerId: session.user.id },
    });

    let credential;
    if (existing) {
      credential = await (prisma as any).apolloCredential.update({
        where: { id: existing.id },
        data: { apiKey: encrypted, label: data.label },
      });
    } else {
      credential = await (prisma as any).apolloCredential.create({
        data: {
          ownerType: 'USER',
          ownerId: session.user.id,
          apiKey: encrypted,
          label: data.label,
          isDefault: false,
        },
      });
    }

    return successResponse({ id: credential.id, label: credential.label }, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Save Apollo credential error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to save credential', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
  }

  await (prisma as any).apolloCredential.deleteMany({
    where: { ownerType: 'USER', ownerId: session.user.id },
  });

  return successResponse({ success: true });
}

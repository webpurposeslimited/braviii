import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401) };
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isSuperAdmin) {
    return { error: errorResponse(ErrorCodes.FORBIDDEN, 'Admin access required', 403) };
  }
  return { user };
}

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireSuperAdmin();
    if (error) return error;

    const group = request.nextUrl.searchParams.get('group');

    const where: Record<string, unknown> = {};
    if (group) where.group = group;

    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: { key: 'asc' },
    });

    const masked = settings.map((s) => ({
      ...s,
      value: s.encrypted ? '••••••••••••' : s.value,
      hasValue: !!s.value,
    }));

    return successResponse(masked);
  } catch (err) {
    console.error('Get settings error:', err);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch settings', 500);
  }
}

const upsertSchema = z.object({
  settings: z.array(z.object({
    key: z.string().min(1),
    value: z.string(),
    group: z.string().default('general'),
    encrypted: z.boolean().default(false),
  })),
});

export async function PUT(request: NextRequest) {
  try {
    const { error } = await requireSuperAdmin();
    if (error) return error;

    const body = await request.json();
    const { settings } = upsertSchema.parse(body);

    const results = await Promise.all(
      settings
        .filter((s) => s.value !== '••••••••••••')
        .map((s) =>
          prisma.systemSetting.upsert({
            where: { key: s.key },
            update: { value: s.value, group: s.group, encrypted: s.encrypted },
            create: { key: s.key, value: s.value, group: s.group, encrypted: s.encrypted },
          })
        )
    );

    return successResponse({ updated: results.length });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, err.errors);
    }
    console.error('Update settings error:', err);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update settings', 500);
  }
}

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

export async function GET() {
  try {
    const { error } = await requireSuperAdmin();
    if (error) return error;

    const plans = await prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return successResponse(plans);
  } catch (err) {
    console.error('Get plans error:', err);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch plans', 500);
  }
}

const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  price: z.number().int().min(0),
  interval: z.enum(['month', 'year']).default('month'),
  description: z.string().max(500).optional(),
  features: z.array(z.string()).default([]),
  limitsJson: z.record(z.number()).optional(),
  active: z.boolean().default(true),
  popular: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  stripePriceId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireSuperAdmin();
    if (error) return error;

    const body = await request.json();
    const data = createPlanSchema.parse(body);

    const plan = await prisma.plan.create({ data });

    return successResponse(plan, undefined, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, err.errors);
    }
    console.error('Create plan error:', err);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create plan', 500);
  }
}

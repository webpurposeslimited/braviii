import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isAdminContext } from '@/lib/admin-guard';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

const updatePlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().int().min(0).optional(),
  interval: z.enum(['month', 'year']).optional(),
  description: z.string().max(500).optional(),
  features: z.array(z.string()).optional(),
  limitsJson: z.record(z.number()).optional(),
  active: z.boolean().optional(),
  popular: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  stripePriceId: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const guard = await requireAdmin();
    if (!isAdminContext(guard)) return guard;
    if (!guard.isSuperAdmin) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Super admin access required', 403);
    }

    const existing = await prisma.plan.findUnique({ where: { id: params.planId } });
    if (!existing) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Plan not found', 404);
    }

    const body = await request.json();
    const data = updatePlanSchema.parse(body);

    const plan = await prisma.plan.update({
      where: { id: params.planId },
      data,
    });

    return successResponse(plan);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, err.errors);
    }
    console.error('Update plan error:', err);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update plan', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const guard = await requireAdmin();
    if (!isAdminContext(guard)) return guard;
    if (!guard.isSuperAdmin) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Super admin access required', 403);
    }

    const existing = await prisma.plan.findUnique({ where: { id: params.planId } });
    if (!existing) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Plan not found', 404);
    }

    await prisma.plan.delete({ where: { id: params.planId } });

    return successResponse({ deleted: true });
  } catch (err) {
    console.error('Delete plan error:', err);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to delete plan', 500);
  }
}

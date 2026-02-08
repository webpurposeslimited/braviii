import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requirePermission, isAdminContext } from '@/lib/admin-guard';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'PENDING', 'WAITING_ON_USER', 'CLOSED']).optional(),
  assignedToAdminId: z.string().nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  const guard = await requirePermission('tickets.reply');
  if (!isAdminContext(guard)) return guard;

  try {
    const body = await request.json();
    const data = updateTicketSchema.parse(body);

    const ticket = await (prisma as any).ticket.findUnique({
      where: { id: params.ticketId },
    });

    if (!ticket) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Ticket not found', 404);
    }

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.assignedToAdminId !== undefined) updateData.assignedToAdminId = data.assignedToAdminId;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status === 'CLOSED') updateData.closedAt = new Date();

    const updated = await (prisma as any).ticket.update({
      where: { id: params.ticketId },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Log status change
    if (data.status && data.status !== ticket.status) {
      await (prisma as any).ticketStatusHistory.create({
        data: {
          ticketId: params.ticketId,
          oldStatus: ticket.status,
          newStatus: data.status,
          changedBy: guard.userId,
          changedByType: 'ADMIN',
        },
      });
    }

    await createAuditLog({
      userId: guard.userId,
      action: 'update',
      entity: 'ticket',
      entityId: params.ticketId,
      oldData: { status: ticket.status, assignedToAdminId: ticket.assignedToAdminId },
      newData: updateData,
    });

    return successResponse(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Update ticket error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update ticket', 500);
  }
}

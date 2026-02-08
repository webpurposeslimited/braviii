import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, ErrorCodes, paginatedResponse } from '@/lib/api-response';
import { createAuditLog } from '@/lib/audit';

const createTicketSchema = z.object({
  subject: z.string().min(3).max(200),
  category: z.string().min(1).max(100),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  message: z.string().min(10).max(5000),
  workspaceId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  const where: Record<string, unknown> = { createdByUserId: session.user.id };
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [tickets, total] = await Promise.all([
    (prisma as any).ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        assignedTo: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
    }),
    (prisma as any).ticket.count({ where }),
  ]);

  return paginatedResponse(tickets, page, limit, total);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
  }

  try {
    const body = await request.json();
    const data = createTicketSchema.parse(body);

    const ticket = await (prisma as any).ticket.create({
      data: {
        subject: data.subject,
        category: data.category,
        priority: data.priority,
        status: 'OPEN',
        createdByUserId: session.user.id,
        tenantId: data.workspaceId || null,
        messages: {
          create: {
            senderType: 'USER',
            senderId: session.user.id,
            message: data.message,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      workspaceId: data.workspaceId,
      action: 'create',
      entity: 'ticket',
      entityId: ticket.id,
      newData: { subject: data.subject, category: data.category, priority: data.priority },
    });

    return successResponse(ticket, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', 400, error.errors);
    }
    console.error('Create ticket error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create ticket', 500);
  }
}

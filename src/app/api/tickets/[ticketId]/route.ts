import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
  }

  const ticket = await (prisma as any).ticket.findUnique({
    where: { id: params.ticketId },
    include: {
      createdBy: { select: { id: true, name: true, email: true, avatar: true } },
      assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          attachments: true,
        },
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!ticket) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Ticket not found', 404);
  }

  // Users can only see their own tickets; admins can see all
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true },
  });

  if (!user?.isSuperAdmin && ticket.createdByUserId !== session.user.id) {
    return errorResponse(ErrorCodes.FORBIDDEN, 'Access denied', 403);
  }

  return successResponse(ticket);
}

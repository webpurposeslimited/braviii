import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { isAdminUser } from '@/lib/permissions';
import { saveUploadedFile, validateFile } from '@/lib/uploads';

const replySchema = z.object({
  message: z.string().min(1).max(5000),
  isInternal: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
  }

  try {
    const formData = await request.formData();
    const messageText = formData.get('message') as string;
    const isInternalStr = formData.get('isInternal') as string;
    const isInternal = isInternalStr === 'true';

    if (!messageText || messageText.trim().length < 1) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Message is required', 400);
    }

    const ticket = await (prisma as any).ticket.findUnique({
      where: { id: params.ticketId },
    });

    if (!ticket) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Ticket not found', 404);
    }

    const isAdmin = await isAdminUser(session.user.id);
    const senderType = isAdmin ? 'ADMIN' : 'USER';

    // Users can only reply to their own tickets
    if (!isAdmin && ticket.createdByUserId !== session.user.id) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    // Only admins can send internal notes
    if (isInternal && !isAdmin) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Only admins can create internal notes', 403);
    }

    // Handle file attachments
    const files = formData.getAll('attachments') as File[];
    const attachmentData: Array<{
      fileUrl: string;
      fileName: string;
      mimeType: string;
      size: number;
    }> = [];

    for (const file of files) {
      if (file.size === 0) continue;

      const validationError = validateFile({
        size: file.size,
        type: file.type,
        name: file.name,
      });

      if (validationError) {
        return errorResponse(ErrorCodes.VALIDATION_ERROR, validationError.message, 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await saveUploadedFile(buffer, file.name, file.type, 'tickets');
      attachmentData.push(result);
    }

    const ticketMessage = await (prisma as any).ticketMessage.create({
      data: {
        ticketId: params.ticketId,
        senderType,
        senderId: session.user.id,
        message: messageText,
        isInternal,
        attachments: attachmentData.length > 0 ? {
          create: attachmentData,
        } : undefined,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        attachments: true,
      },
    });

    // Update ticket status based on who replied
    const newStatus = isAdmin ? 'WAITING_ON_USER' : 'OPEN';
    if (ticket.status !== newStatus && ticket.status !== 'CLOSED') {
      await (prisma as any).ticket.update({
        where: { id: params.ticketId },
        data: { status: newStatus },
      });

      await (prisma as any).ticketStatusHistory.create({
        data: {
          ticketId: params.ticketId,
          oldStatus: ticket.status,
          newStatus,
          changedBy: session.user.id,
          changedByType: senderType,
        },
      });
    }

    return successResponse(ticketMessage, undefined, 201);
  } catch (error) {
    console.error('Reply to ticket error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to reply', 500);
  }
}

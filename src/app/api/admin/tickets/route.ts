import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, isAdminContext } from '@/lib/admin-guard';
import { successResponse, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const guard = await requirePermission('tickets.read');
  if (!isAdminContext(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const category = searchParams.get('category');
  const assignedTo = searchParams.get('assignedTo');
  const search = searchParams.get('search');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category) where.category = category;
  if (assignedTo) where.assignedToAdminId = assignedTo;
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { createdBy: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [tickets, total] = await Promise.all([
    (prisma as any).ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true } },
      },
    }),
    (prisma as any).ticket.count({ where }),
  ]);

  return paginatedResponse(tickets, page, limit, total);
}

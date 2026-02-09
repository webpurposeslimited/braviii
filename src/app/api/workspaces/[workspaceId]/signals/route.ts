import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/workspace';

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await checkWorkspaceAccess(params.workspaceId, session.user.id);
  if (!access) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const signals = await prisma.signal.findMany({
    where: { workspaceId: params.workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: signals });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await checkWorkspaceAccess(params.workspaceId, session.user.id);
  if (!access) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const body = await request.json();
  const { name, type, frequency, folder, config } = body;

  if (!name || !type) {
    return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
  }

  const signal = await prisma.signal.create({
    data: {
      workspaceId: params.workspaceId,
      name,
      type,
      frequency: frequency || 'daily',
      folder: folder || null,
      config: config || null,
    },
  });

  return NextResponse.json({ success: true, data: signal }, { status: 201 });
}

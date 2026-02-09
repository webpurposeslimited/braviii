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

  const files = await prisma.workspaceFile.findMany({
    where: { workspaceId: params.workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: files });
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
  const { name, type, tags } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const file = await prisma.workspaceFile.create({
    data: {
      workspaceId: params.workspaceId,
      name,
      type: type || 'table',
      tags: tags || [],
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ success: true, data: file }, { status: 201 });
}

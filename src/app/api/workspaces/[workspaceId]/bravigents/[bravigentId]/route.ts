import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/workspace';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { workspaceId: string; bravigentId: string } }
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
  const agent = await prisma.bravigent.update({
    where: { id: params.bravigentId, workspaceId: params.workspaceId },
    data: body,
  });

  return NextResponse.json({ success: true, data: agent });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string; bravigentId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await checkWorkspaceAccess(params.workspaceId, session.user.id);
  if (!access) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  await prisma.bravigent.delete({
    where: { id: params.bravigentId, workspaceId: params.workspaceId },
  });

  return NextResponse.json({ success: true });
}

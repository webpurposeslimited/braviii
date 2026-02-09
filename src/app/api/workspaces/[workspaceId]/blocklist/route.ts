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

  const entries = await prisma.suppressionEntry.findMany({
    where: { workspaceId: params.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ success: true, data: entries });
}

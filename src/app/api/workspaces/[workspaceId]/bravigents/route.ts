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

  const agents = await prisma.bravigent.findMany({
    where: { workspaceId: params.workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: agents });
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
  const { name, prompt, model, tools, config } = body;

  if (!name || !prompt) {
    return NextResponse.json({ error: 'Name and prompt are required' }, { status: 400 });
  }

  const agent = await prisma.bravigent.create({
    data: {
      workspaceId: params.workspaceId,
      name,
      prompt,
      model: model || 'auto',
      tools: tools || [],
      config: config || null,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ success: true, data: agent }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = request.headers.get('x-workspace-id');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: session.user.id },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { workspaceId },
    });

    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          balance: 0,
          included: 0,
          extra: 0,
          used: 0,
          plan: 'FREE',
        },
      });
    }

    const balance = subscription.creditsIncluded + subscription.creditsExtra - subscription.creditsUsed;

    // Get recent usage
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let history = null;
    if (includeHistory) {
      history = await prisma.creditsLedger.findMany({
        where: { workspaceId },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: Math.max(0, balance),
        included: subscription.creditsIncluded,
        extra: subscription.creditsExtra,
        used: subscription.creditsUsed,
        plan: subscription.plan,
        periodStart: subscription.currentPeriodStart,
        periodEnd: subscription.currentPeriodEnd,
        history,
      },
    });
  } catch (error) {
    console.error('Get credits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

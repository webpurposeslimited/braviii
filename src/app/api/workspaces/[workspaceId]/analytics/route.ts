import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/workspace';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { hasAccess } = await checkWorkspaceAccess(params.workspaceId, session.user.id);
    if (!hasAccess) {
      return errorResponse(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    const [
      totalLeads,
      newLeadsThisMonth,
      totalSequences,
      activeSequences,
      campaigns,
    ] = await Promise.all([
      prisma.lead.count({ where: { workspaceId: params.workspaceId } }),
      prisma.lead.count({
        where: {
          workspaceId: params.workspaceId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.sequence.count({ where: { workspaceId: params.workspaceId } }),
      prisma.sequence.count({ where: { workspaceId: params.workspaceId, status: 'ACTIVE' } }),
      prisma.campaign.findMany({
        where: { sequence: { workspaceId: params.workspaceId } },
        select: {
          id: true,
          name: true,
          status: true,
          totalLeads: true,
          sent: true,
          opened: true,
          clicked: true,
          replied: true,
          bounced: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
    const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0);
    const totalReplied = campaigns.reduce((s, c) => s + c.replied, 0);
    const totalBounced = campaigns.reduce((s, c) => s + c.bounced, 0);
    const totalClicked = campaigns.reduce((s, c) => s + c.clicked, 0);

    return successResponse({
      overview: {
        totalLeads,
        newLeadsThisMonth,
        totalSequences,
        activeSequences,
        totalSent,
        openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
        replyRate: totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0,
        bounceRate: totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0,
        clickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
      },
      campaigns,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch analytics', 500);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { emailVerificationService } from '@/lib/email-verification/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
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

    const job = await emailVerificationService.getJobDetails(params.jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: job.id,
        name: job.name,
        status: job.status,
        totalEmails: job.totalEmails,
        processed: job.processed,
        valid: job.valid,
        invalid: job.invalid,
        risky: job.risky,
        catchAll: job.catchAll,
        unknown: job.unknown,
        creditsUsed: job.creditsUsed,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        error: job.error,
        progress: job.totalEmails > 0 
          ? Math.round((job.processed / job.totalEmails) * 100) 
          : 0,
        results: job.results,
      },
    });
  } catch (error) {
    console.error('Get job details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

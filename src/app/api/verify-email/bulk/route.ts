import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { emailVerificationService } from '@/lib/email-verification/service';
import { addBulkVerificationJob } from '@/lib/queue';
import { z } from 'zod';

const bulkVerifySchema = z.object({
  emails: z.array(z.object({
    email: z.string().email(),
    leadId: z.string().optional(),
  })).min(1).max(10000),
  source: z.enum(['csv', 'list', 'api']).default('csv'),
  jobName: z.string().optional(),
});

const listVerifySchema = z.object({
  listId: z.string(),
  jobName: z.string().optional(),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Check if this is a list-based verification
    if (body.listId) {
      const listValidation = listVerifySchema.safeParse(body);
      if (!listValidation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: listValidation.error.flatten() },
          { status: 400 }
        );
      }

      const { listId, jobName } = listValidation.data;

      // Get leads from list
      const listMembers = await prisma.listMember.findMany({
        where: { listId },
        include: {
          lead: {
            select: { id: true, email: true },
          },
        },
      });

      const emails = listMembers
        .filter(m => m.lead.email)
        .map(m => ({ email: m.lead.email!, leadId: m.lead.id }));

      if (emails.length === 0) {
        return NextResponse.json(
          { error: 'No emails found in list' },
          { status: 400 }
        );
      }

      const jobResult = await emailVerificationService.createBulkVerificationJob({
        workspaceId,
        emails,
        source: 'list',
        jobName: jobName || `List verification`,
      });

      if (!jobResult.success) {
        return NextResponse.json(
          { error: jobResult.error },
          { status: 402 }
        );
      }

      // Add to background queue
      await addBulkVerificationJob({
        jobId: jobResult.jobId!,
        workspaceId,
        emails,
      });

      return NextResponse.json({
        success: true,
        jobId: jobResult.jobId,
        totalEmails: jobResult.totalEmails,
        estimatedCredits: jobResult.estimatedCredits,
        message: 'Bulk verification job queued successfully',
      });
    }

    // Direct email array verification
    const validation = bulkVerifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { emails, source, jobName } = validation.data;

    const jobResult = await emailVerificationService.createBulkVerificationJob({
      workspaceId,
      emails,
      source,
      jobName,
    });

    if (!jobResult.success) {
      return NextResponse.json(
        { error: jobResult.error },
        { status: 402 }
      );
    }

    // Add to background queue
    await addBulkVerificationJob({
      jobId: jobResult.jobId!,
      workspaceId,
      emails,
    });

    return NextResponse.json({
      success: true,
      jobId: jobResult.jobId,
      totalEmails: jobResult.totalEmails,
      estimatedCredits: jobResult.estimatedCredits,
      message: 'Bulk verification job queued successfully',
    });
  } catch (error) {
    console.error('Bulk verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { jobs, total } = await emailVerificationService.getVerificationJobs(
      workspaceId,
      { limit, offset }
    );

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + jobs.length < total,
      },
    });
  } catch (error) {
    console.error('Get verification jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addSuppressionSchema = z.object({
  email: z.string().email('Invalid email format'),
  reason: z.enum(['BOUNCED', 'COMPLAINED', 'UNSUBSCRIBED', 'INVALID', 'MANUAL']),
  source: z.string().optional(),
});

const bulkAddSchema = z.object({
  emails: z.array(z.object({
    email: z.string().email(),
    reason: z.enum(['BOUNCED', 'COMPLAINED', 'UNSUBSCRIBED', 'INVALID', 'MANUAL']).optional(),
  })).min(1).max(10000),
  defaultReason: z.enum(['BOUNCED', 'COMPLAINED', 'UNSUBSCRIBED', 'INVALID', 'MANUAL']).default('MANUAL'),
});

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
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const reason = searchParams.get('reason');
    const search = searchParams.get('search');

    const where: any = { workspaceId };
    if (reason) where.reason = reason;
    if (search) where.email = { contains: search.toLowerCase() };

    const [entries, total] = await Promise.all([
      prisma.suppressionEntry.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.suppressionEntry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: entries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + entries.length < total,
      },
    });
  } catch (error) {
    console.error('Get suppression list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Check if bulk upload
    if (body.emails) {
      const validation = bulkAddSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.flatten() },
          { status: 400 }
        );
      }

      const { emails, defaultReason } = validation.data;
      let added = 0;
      let skipped = 0;

      for (const { email, reason } of emails) {
        try {
          await prisma.suppressionEntry.upsert({
            where: {
              workspaceId_email: { workspaceId, email: email.toLowerCase() },
            },
            update: {
              reason: reason || defaultReason,
            },
            create: {
              workspaceId,
              email: email.toLowerCase(),
              reason: reason || defaultReason,
              source: 'bulk_upload',
            },
          });
          added++;
        } catch {
          skipped++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Added ${added} emails to suppression list (${skipped} skipped)`,
        added,
        skipped,
      });
    }

    // Single email add
    const validation = addSuppressionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, reason, source } = validation.data;

    const entry = await prisma.suppressionEntry.upsert({
      where: {
        workspaceId_email: { workspaceId, email: email.toLowerCase() },
      },
      update: {
        reason,
        source,
      },
      create: {
        workspaceId,
        email: email.toLowerCase(),
        reason,
        source,
      },
    });

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Add to suppression list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await prisma.suppressionEntry.deleteMany({
      where: {
        workspaceId,
        email: email.toLowerCase(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email removed from suppression list',
    });
  } catch (error) {
    console.error('Remove from suppression list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { emailVerificationService } from '@/lib/email-verification/service';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
  leadId: z.string().optional(),
  source: z.enum(['manual', 'csv', 'apollo', 'google_maps', 'api']).default('manual'),
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

    // Verify workspace access
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: session.user.id },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = verifyEmailSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, leadId, source } = validationResult.data;

    // Perform verification
    const result = await emailVerificationService.verifySingleEmail({
      email,
      workspaceId,
      leadId,
      source,
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          creditsRemaining: result.creditsRemaining,
        },
        { status: 402 } // Payment Required
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: result.result?.email,
        status: result.result?.status,
        reason: result.result?.reason,
        mxRecords: result.result?.mxRecords,
        provider: result.result?.provider,
        isDisposable: result.result?.isDisposable,
        isRoleAccount: result.result?.isRoleAccount,
        isCatchAll: result.result?.isCatchAll,
        verifiedAt: result.result?.verifiedAt,
      },
      creditsUsed: result.creditsUsed,
      creditsRemaining: result.creditsRemaining,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

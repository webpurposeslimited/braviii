import { prisma } from '@/lib/prisma';
import { EmailValidator, VerificationResult, VerificationStatus } from './validator';

type EmailStatus = 'VALID' | 'INVALID' | 'RISKY' | 'CATCH_ALL' | 'UNKNOWN' | 'PENDING';
type SuppressionReason = 'BOUNCED' | 'COMPLAINED' | 'UNSUBSCRIBED' | 'INVALID' | 'MANUAL';
const CREDIT_TYPE_USAGE = 'USAGE';

const VERIFICATION_CREDIT_COST = 1;

export interface VerifyEmailInput {
  email: string;
  workspaceId: string;
  leadId?: string;
  source?: 'manual' | 'csv' | 'apollo' | 'google_maps' | 'api';
  jobId?: string;
}

export interface VerifyEmailOutput {
  success: boolean;
  result?: VerificationResult;
  error?: string;
  creditsUsed: number;
  creditsRemaining: number;
}

export interface BulkVerifyInput {
  workspaceId: string;
  emails: Array<{ email: string; leadId?: string }>;
  source?: 'csv' | 'list' | 'api';
  jobName?: string;
}

function mapStatusToPrisma(status: VerificationStatus): EmailStatus {
  const mapping: Record<VerificationStatus, EmailStatus> = {
    valid: 'VALID',
    invalid: 'INVALID',
    risky: 'RISKY',
    catch_all: 'CATCH_ALL',
    unknown: 'UNKNOWN',
  };
  return mapping[status];
}

export class EmailVerificationService {
  private validator: EmailValidator;

  constructor() {
    this.validator = new EmailValidator();
  }

  async getCreditsBalance(workspaceId: string): Promise<number> {
    const subscription = await prisma.subscription.findUnique({
      where: { workspaceId },
    });

    if (!subscription) {
      return 0;
    }

    const totalCredits = subscription.creditsIncluded + subscription.creditsExtra;
    const availableCredits = totalCredits - subscription.creditsUsed;
    return Math.max(0, availableCredits);
  }

  async checkCredits(workspaceId: string, required: number): Promise<{ hasCredits: boolean; available: number }> {
    const available = await this.getCreditsBalance(workspaceId);
    return {
      hasCredits: available >= required,
      available,
    };
  }

  async consumeCredits(
    workspaceId: string,
    amount: number,
    description: string,
    reference?: string
  ): Promise<{ success: boolean; newBalance: number }> {
    const creditCheck = await this.checkCredits(workspaceId, amount);
    
    if (!creditCheck.hasCredits) {
      return { success: false, newBalance: creditCheck.available };
    }

    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.update({
        where: { workspaceId },
        data: {
          creditsUsed: { increment: amount },
        },
      });

      const newBalance = subscription.creditsIncluded + subscription.creditsExtra - subscription.creditsUsed;

      await tx.creditsLedger.create({
        data: {
          workspaceId,
          type: CREDIT_TYPE_USAGE as any,
          amount: -amount,
          balance: newBalance,
          description,
          reference,
        },
      });

      return newBalance;
    });

    return { success: true, newBalance: result };
  }

  async verifySingleEmail(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
    const { email, workspaceId, leadId, source = 'manual', jobId } = input;

    // Check credits before verification
    const creditCheck = await this.checkCredits(workspaceId, VERIFICATION_CREDIT_COST);
    if (!creditCheck.hasCredits) {
      return {
        success: false,
        error: 'Insufficient credits. Please purchase more credits to continue.',
        creditsUsed: 0,
        creditsRemaining: creditCheck.available,
      };
    }

    // Check if email is already in suppression list
    const suppressed = await prisma.suppressionEntry.findUnique({
      where: {
        workspaceId_email: { workspaceId, email: email.toLowerCase() },
      },
    });

    if (suppressed) {
      return {
        success: true,
        result: {
          email: email.toLowerCase(),
          status: 'invalid',
          reason: 'mailbox_unavailable',
          mxRecords: [],
          provider: null,
          isDisposable: false,
          isRoleAccount: false,
          isCatchAll: false,
          smtpResponse: `Email is suppressed: ${suppressed.reason}`,
          verifiedAt: new Date(),
        },
        creditsUsed: 0,
        creditsRemaining: creditCheck.available,
      };
    }

    // Perform verification
    const result = await this.validator.verify(email);

    // Consume credits
    const creditResult = await this.consumeCredits(
      workspaceId,
      VERIFICATION_CREDIT_COST,
      `Email verification: ${email}`,
      leadId || jobId
    );

    // Store verification result
    await prisma.verificationResult.create({
      data: {
        verificationJobId: jobId,
        leadId,
        email: result.email,
        status: mapStatusToPrisma(result.status),
        reason: result.reason,
        mxRecords: result.mxRecords,
        provider: result.provider,
      },
    });

    // Update lead if provided
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          emailStatus: mapStatusToPrisma(result.status),
          emailVerifiedAt: new Date(),
        },
      });
    }

    // Auto-add to suppression list if invalid
    if (result.status === 'invalid') {
      await this.addToSuppressionList(workspaceId, email, 'INVALID', source);
    }

    return {
      success: true,
      result,
      creditsUsed: VERIFICATION_CREDIT_COST,
      creditsRemaining: creditResult.newBalance,
    };
  }

  async createBulkVerificationJob(input: BulkVerifyInput): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
    totalEmails: number;
    estimatedCredits: number;
  }> {
    const { workspaceId, emails, source = 'csv', jobName } = input;
    const uniqueEmails = Array.from(new Map(emails.map(e => [e.email.toLowerCase(), e])).values());
    const totalEmails = uniqueEmails.length;
    const estimatedCredits = totalEmails * VERIFICATION_CREDIT_COST;

    // Check credits
    const creditCheck = await this.checkCredits(workspaceId, estimatedCredits);
    if (!creditCheck.hasCredits) {
      return {
        success: false,
        error: `Insufficient credits. You need ${estimatedCredits} credits but only have ${creditCheck.available}.`,
        totalEmails,
        estimatedCredits,
      };
    }

    // Create verification job
    const job = await prisma.verificationJob.create({
      data: {
        workspaceId,
        name: jobName || `Bulk verification - ${new Date().toISOString()}`,
        status: 'PENDING',
        totalEmails,
      },
    });

    return {
      success: true,
      jobId: job.id,
      totalEmails,
      estimatedCredits,
    };
  }

  async processBulkVerificationJob(
    jobId: string,
    emails: Array<{ email: string; leadId?: string }>,
    onProgress?: (progress: { processed: number; total: number }) => void
  ): Promise<void> {
    const job = await prisma.verificationJob.findUnique({
      where: { id: jobId },
      include: { workspace: true },
    });

    if (!job) {
      throw new Error('Verification job not found');
    }

    await prisma.verificationJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    let processed = 0;
    let valid = 0;
    let invalid = 0;
    let risky = 0;
    let catchAll = 0;
    let unknown = 0;
    let creditsUsed = 0;

    for (const { email, leadId } of emails) {
      try {
        const result = await this.verifySingleEmail({
          email,
          workspaceId: job.workspaceId,
          leadId,
          source: 'csv',
          jobId,
        });

        if (result.success && result.result) {
          creditsUsed += result.creditsUsed;
          
          switch (result.result.status) {
            case 'valid': valid++; break;
            case 'invalid': invalid++; break;
            case 'risky': risky++; break;
            case 'catch_all': catchAll++; break;
            default: unknown++; break;
          }
        } else {
          unknown++;
        }
      } catch (error) {
        unknown++;
      }

      processed++;
      
      // Update job progress every 10 emails
      if (processed % 10 === 0 || processed === emails.length) {
        await prisma.verificationJob.update({
          where: { id: jobId },
          data: { processed, valid, invalid, risky, catchAll, unknown, creditsUsed },
        });

        if (onProgress) {
          onProgress({ processed, total: emails.length });
        }
      }

      // Rate limiting - small delay between verifications
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await prisma.verificationJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        processed,
        valid,
        invalid,
        risky,
        catchAll,
        unknown,
        creditsUsed,
      },
    });
  }

  async addToSuppressionList(
    workspaceId: string,
    email: string,
    reason: SuppressionReason,
    source?: string
  ): Promise<void> {
    await prisma.suppressionEntry.upsert({
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
  }

  async removeFromSuppressionList(workspaceId: string, email: string): Promise<void> {
    await prisma.suppressionEntry.deleteMany({
      where: {
        workspaceId,
        email: email.toLowerCase(),
      },
    });
  }

  async isEmailSuppressed(workspaceId: string, email: string): Promise<boolean> {
    const entry = await prisma.suppressionEntry.findUnique({
      where: {
        workspaceId_email: { workspaceId, email: email.toLowerCase() },
      },
    });
    return !!entry;
  }

  async getSuppressionList(
    workspaceId: string,
    options?: { limit?: number; offset?: number; reason?: SuppressionReason }
  ): Promise<{ entries: any[]; total: number }> {
    const { limit = 50, offset = 0, reason } = options || {};

    const where = {
      workspaceId,
      ...(reason && { reason }),
    };

    const [entries, total] = await Promise.all([
      prisma.suppressionEntry.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.suppressionEntry.count({ where }),
    ]);

    return { entries, total };
  }

  async getVerificationHistory(
    workspaceId: string,
    options?: { limit?: number; offset?: number; status?: EmailStatus }
  ): Promise<{ results: any[]; total: number }> {
    const { limit = 50, offset = 0, status } = options || {};

    const where = {
      verificationJob: { workspaceId },
      ...(status && { status }),
    };

    const [results, total] = await Promise.all([
      prisma.verificationResult.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.verificationResult.count({ where }),
    ]);

    return { results, total };
  }

  async getVerificationJobs(
    workspaceId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ jobs: any[]; total: number }> {
    const { limit = 20, offset = 0 } = options || {};

    const [jobs, total] = await Promise.all([
      prisma.verificationJob.findMany({
        where: { workspaceId },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.verificationJob.count({ where: { workspaceId } }),
    ]);

    return { jobs, total };
  }

  async getJobDetails(jobId: string): Promise<any> {
    return prisma.verificationJob.findUnique({
      where: { id: jobId },
      include: {
        results: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}

export const emailVerificationService = new EmailVerificationService();

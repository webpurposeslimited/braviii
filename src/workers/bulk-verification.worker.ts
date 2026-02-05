import { Worker, Job } from 'bullmq';
import { emailVerificationService } from '@/lib/email-verification/service';
import { prisma } from '@/lib/prisma';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

interface BulkVerificationJobData {
  jobId: string;
  workspaceId: string;
  emails: Array<{ email: string; leadId?: string }>;
}

async function processBulkVerification(job: Job<BulkVerificationJobData>) {
  const { jobId, workspaceId, emails } = job.data;

  console.log(`[BulkVerification] Starting job ${jobId} with ${emails.length} emails`);

  try {
    // Update job status to processing
    await prisma.verificationJob.update({
      where: { id: jobId },
      data: { 
        status: 'PROCESSING', 
        startedAt: new Date() 
      },
    });

    let processed = 0;
    let valid = 0;
    let invalid = 0;
    let risky = 0;
    let catchAll = 0;
    let unknown = 0;
    let creditsUsed = 0;
    const totalEmails = emails.length;

    for (const { email, leadId } of emails) {
      try {
        const result = await emailVerificationService.verifySingleEmail({
          email,
          workspaceId,
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
          
          // If out of credits, stop processing
          if (result.error?.includes('Insufficient credits')) {
            console.log(`[BulkVerification] Job ${jobId} stopped: insufficient credits`);
            
            await prisma.verificationJob.update({
              where: { id: jobId },
              data: {
                status: 'FAILED',
                error: 'Insufficient credits to complete verification',
                processed,
                valid,
                invalid,
                risky,
                catchAll,
                unknown,
                creditsUsed,
              },
            });
            
            return { success: false, error: 'Insufficient credits' };
          }
        }
      } catch (error) {
        console.error(`[BulkVerification] Error verifying ${email}:`, error);
        unknown++;
      }

      processed++;

      // Update progress every 10 emails or at the end
      if (processed % 10 === 0 || processed === totalEmails) {
        await prisma.verificationJob.update({
          where: { id: jobId },
          data: { 
            processed, 
            valid, 
            invalid, 
            risky, 
            catchAll, 
            unknown, 
            creditsUsed 
          },
        });

        // Update job progress for BullMQ dashboard
        await job.updateProgress(Math.round((processed / totalEmails) * 100));
      }

      // Rate limiting - 100ms between verifications
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Mark job as completed
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

    console.log(`[BulkVerification] Job ${jobId} completed: ${valid} valid, ${invalid} invalid, ${risky} risky`);

    return {
      success: true,
      processed,
      valid,
      invalid,
      risky,
      catchAll,
      unknown,
      creditsUsed,
    };
  } catch (error) {
    console.error(`[BulkVerification] Job ${jobId} failed:`, error);

    await prisma.verificationJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

export const bulkVerificationWorker = new Worker(
  'email-verification',
  async (job: Job) => {
    if (job.name === 'bulk-verify') {
      return processBulkVerification(job as Job<BulkVerificationJobData>);
    }
    
    // Handle single verification jobs (legacy)
    if (job.name === 'verify') {
      const { workspaceId, leadId, email } = job.data;
      return emailVerificationService.verifySingleEmail({
        email,
        workspaceId,
        leadId,
        source: 'api',
      });
    }
  },
  {
    connection,
    concurrency: 1, // Process one job at a time for rate limiting
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

bulkVerificationWorker.on('completed', (job) => {
  console.log(`[BulkVerification] Job ${job.id} completed successfully`);
});

bulkVerificationWorker.on('failed', (job, err) => {
  console.error(`[BulkVerification] Job ${job?.id} failed:`, err.message);
});

bulkVerificationWorker.on('progress', (job, progress) => {
  console.log(`[BulkVerification] Job ${job.id} progress: ${progress}%`);
});

export default bulkVerificationWorker;

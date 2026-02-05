import { Worker, Job } from 'bullmq';
import { emailVerificationService } from '@/lib/email-verification/service';
import { EmailVerificationJob } from '@/lib/queue';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const worker = new Worker<EmailVerificationJob>(
  'email-verification',
  async (job: Job<EmailVerificationJob>) => {
    const { workspaceId, leadId, email } = job.data;

    console.log(`[EmailVerification] Verifying email: ${email} for lead ${leadId}`);

    try {
      // Use the real email verification service (includes credit checking)
      const result = await emailVerificationService.verifySingleEmail({
        email,
        workspaceId,
        leadId,
        source: 'api',
      });

      if (!result.success) {
        throw new Error(result.error || 'Verification failed');
      }

      console.log(`[EmailVerification] Email ${email} verified: ${result.result?.status}`);

      return {
        success: true,
        status: result.result?.status,
        reason: result.result?.reason,
        creditsUsed: result.creditsUsed,
      };
    } catch (error) {
      console.error(`[EmailVerification] Error verifying ${email}:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`[EmailVerification] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[EmailVerification] Job ${job?.id} failed:`, err.message);
});

export default worker;

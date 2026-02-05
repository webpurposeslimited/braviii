import { Queue, Worker, Job } from 'bullmq';
import { redis } from './redis';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const emailVerificationQueue = new Queue('email-verification', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

export const enrichmentQueue = new Queue('enrichment', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

export const emailSendingQueue = new Queue('email-sending', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export const webhookQueue = new Queue('webhooks', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

export interface EmailVerificationJob {
  workspaceId: string;
  leadId: string;
  email: string;
}

export interface BulkVerificationJob {
  jobId: string;
  workspaceId: string;
  emails: Array<{ email: string; leadId?: string }>;
}

export interface EnrichmentJob {
  workspaceId: string;
  leadId: string;
  workflowId?: string;
  stepId?: string;
  type: 'domain' | 'person' | 'company';
  data: Record<string, unknown>;
}

export interface EmailSendingJob {
  workspaceId: string;
  campaignId: string;
  enrollmentId: string;
  stepId: string;
  toEmail: string;
  toName?: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  sendingAccountId: string;
  scheduledAt?: Date;
}

export interface WebhookJob {
  workspaceId: string;
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  url: string;
  secret?: string;
}

export async function addEmailVerificationJob(data: EmailVerificationJob) {
  return emailVerificationQueue.add('verify', data);
}

export async function addBulkVerificationJob(data: BulkVerificationJob) {
  return emailVerificationQueue.add('bulk-verify', data, {
    attempts: 1,
    removeOnComplete: false,
  });
}

export async function addEnrichmentJob(data: EnrichmentJob) {
  return enrichmentQueue.add('enrich', data);
}

export async function addEmailSendingJob(data: EmailSendingJob, delay?: number) {
  const options = delay ? { delay } : undefined;
  return emailSendingQueue.add('send', data, options);
}

export async function addWebhookJob(data: WebhookJob) {
  return webhookQueue.add('deliver', data);
}

export async function getQueueStats(queueName: string) {
  const queues: Record<string, Queue> = {
    'email-verification': emailVerificationQueue,
    'enrichment': enrichmentQueue,
    'email-sending': emailSendingQueue,
    'webhooks': webhookQueue,
  };

  const queue = queues[queueName];
  if (!queue) return null;

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

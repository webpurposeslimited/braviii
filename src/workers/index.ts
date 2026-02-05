import { Worker } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

console.log('[Workers] Starting Bravilio background workers...');

// Email Verification Worker
import('./bulk-verification.worker').then((module) => {
  console.log('[Workers] Email verification worker started');
}).catch((err) => {
  console.error('[Workers] Failed to start email verification worker:', err);
});

// Enrichment Worker
const enrichmentWorker = new Worker(
  'enrichment',
  async (job) => {
    console.log(`[Enrichment] Processing job ${job.id}:`, job.name);
    
    const { workspaceId, leadId, type, data } = job.data;
    
    try {
      // Dynamic import to avoid circular dependencies
      const { prisma } = await import('@/lib/prisma');
      
      switch (type) {
        case 'domain':
          // Domain enrichment logic
          console.log(`[Enrichment] Enriching domain for lead ${leadId}`);
          break;
        case 'person':
          // Person enrichment logic  
          console.log(`[Enrichment] Enriching person data for lead ${leadId}`);
          break;
        case 'company':
          // Company enrichment logic
          console.log(`[Enrichment] Enriching company data for lead ${leadId}`);
          break;
      }
      
      return { success: true, leadId };
    } catch (error) {
      console.error(`[Enrichment] Job ${job.id} failed:`, error);
      throw error;
    }
  },
  { connection, concurrency: 5 }
);

enrichmentWorker.on('completed', (job) => {
  console.log(`[Enrichment] Job ${job.id} completed`);
});

enrichmentWorker.on('failed', (job, err) => {
  console.error(`[Enrichment] Job ${job?.id} failed:`, err.message);
});

// Email Sending Worker
const emailSendingWorker = new Worker(
  'email-sending',
  async (job) => {
    console.log(`[EmailSending] Processing job ${job.id}:`, job.name);
    
    const { 
      workspaceId, 
      campaignId, 
      enrollmentId, 
      toEmail, 
      toName,
      subject, 
      htmlBody, 
      textBody,
      sendingAccountId 
    } = job.data;
    
    try {
      const { prisma } = await import('@/lib/prisma');
      
      // Get sending account
      const sendingAccount = await prisma.sendingAccount.findUnique({
        where: { id: sendingAccountId },
      });
      
      if (!sendingAccount) {
        throw new Error('Sending account not found');
      }
      
      // Check daily limit
      if (sendingAccount.sentToday >= sendingAccount.dailyLimit) {
        throw new Error('Daily sending limit reached');
      }
      
      // Send email based on account type
      let messageId: string | null = null;
      
      switch (sendingAccount.type) {
        case 'SMTP':
          // SMTP sending logic would go here
          console.log(`[EmailSending] Sending via SMTP to ${toEmail}`);
          messageId = `smtp_${Date.now()}`;
          break;
        case 'GMAIL':
          // Gmail API sending logic would go here
          console.log(`[EmailSending] Sending via Gmail to ${toEmail}`);
          messageId = `gmail_${Date.now()}`;
          break;
        case 'MICROSOFT':
          // Microsoft Graph API sending logic would go here
          console.log(`[EmailSending] Sending via Microsoft to ${toEmail}`);
          messageId = `ms_${Date.now()}`;
          break;
      }
      
      // Update sent count
      await prisma.sendingAccount.update({
        where: { id: sendingAccountId },
        data: { sentToday: { increment: 1 } },
      });
      
      // Update campaign send record
      await prisma.campaignSend.update({
        where: { id: enrollmentId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          messageId,
        },
      });
      
      // Update campaign stats
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { sent: { increment: 1 } },
      });
      
      return { success: true, messageId };
    } catch (error) {
      console.error(`[EmailSending] Job ${job.id} failed:`, error);
      
      // Update campaign send as failed
      const { prisma } = await import('@/lib/prisma');
      await prisma.campaignSend.update({
        where: { id: enrollmentId },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      
      throw error;
    }
  },
  { connection, concurrency: 2 }
);

emailSendingWorker.on('completed', (job) => {
  console.log(`[EmailSending] Job ${job.id} completed`);
});

emailSendingWorker.on('failed', (job, err) => {
  console.error(`[EmailSending] Job ${job?.id} failed:`, err.message);
});

// Webhook Delivery Worker
const webhookWorker = new Worker(
  'webhooks',
  async (job) => {
    console.log(`[Webhook] Processing job ${job.id}:`, job.name);
    
    const { workspaceId, webhookId, event, payload, url, secret } = job.data;
    
    try {
      const { prisma } = await import('@/lib/prisma');
      const crypto = await import('crypto');
      
      // Generate signature if secret provided
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Bravilio-Event': event,
        'X-Bravilio-Delivery': job.id || '',
      };
      
      if (secret) {
        const signature = crypto
          .createHmac('sha256', secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        headers['X-Bravilio-Signature'] = `sha256=${signature}`;
      }
      
      // Send webhook
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Webhook delivery failed: ${response.status} ${response.statusText}`);
      }
      
      // Update webhook event status
      await prisma.webhookEvent.update({
        where: { id: webhookId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });
      
      return { success: true, statusCode: response.status };
    } catch (error) {
      console.error(`[Webhook] Job ${job.id} failed:`, error);
      
      const { prisma } = await import('@/lib/prisma');
      await prisma.webhookEvent.update({
        where: { id: webhookId },
        data: {
          status: 'FAILED',
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      
      throw error;
    }
  },
  { connection, concurrency: 10 }
);

webhookWorker.on('completed', (job) => {
  console.log(`[Webhook] Job ${job.id} completed`);
});

webhookWorker.on('failed', (job, err) => {
  console.error(`[Webhook] Job ${job?.id} failed:`, err.message);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('[Workers] Shutting down workers...');
  
  await Promise.all([
    enrichmentWorker.close(),
    emailSendingWorker.close(),
    webhookWorker.close(),
  ]);
  
  console.log('[Workers] All workers stopped');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('[Workers] All workers initialized and running');

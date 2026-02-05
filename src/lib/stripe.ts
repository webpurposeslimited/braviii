import Stripe from 'stripe';
import { prisma } from './prisma';
import { addCredits } from './credits';
import { CreditType } from '@prisma/client';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const PLANS = {
  FREE: {
    name: 'Free',
    priceId: null,
    credits: 100,
    features: {
      leads: 100,
      sequences: 1,
      sendingAccounts: 1,
      teamMembers: 1,
    },
  },
  STARTER: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    credits: 1000,
    features: {
      leads: 1000,
      sequences: 3,
      sendingAccounts: 1,
      teamMembers: 3,
    },
  },
  PROFESSIONAL: {
    name: 'Professional',
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    credits: 5000,
    features: {
      leads: 10000,
      sequences: -1,
      sendingAccounts: 5,
      teamMembers: 10,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    credits: 25000,
    features: {
      leads: -1,
      sequences: -1,
      sendingAccounts: -1,
      teamMembers: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export async function createCheckoutSession(
  workspaceId: string,
  priceId: string,
  customerId?: string,
  successUrl?: string,
  cancelUrl?: string
) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { subscription: true },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  let stripeCustomerId = workspace.subscription?.stripeCustomerId;

  if (!stripeCustomerId && customerId) {
    stripeCustomerId = customerId;
  }

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      metadata: {
        workspaceId,
      },
    });
    stripeCustomerId = customer.id;

    if (workspace.subscription) {
      await prisma.subscription.update({
        where: { workspaceId },
        data: { stripeCustomerId },
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl || `${process.env.NEXTAUTH_URL}/dashboard/billing?success=true`,
    cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
    metadata: {
      workspaceId,
    },
  });

  return session;
}

export async function createPortalSession(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { subscription: true },
  });

  if (!workspace?.subscription?.stripeCustomerId) {
    throw new Error('No Stripe customer found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.subscription.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
  });

  return session;
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const workspaceId = subscription.metadata.workspaceId;
  
  if (!workspaceId) {
    console.error('No workspaceId in subscription metadata');
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  
  let plan: PlanType = 'FREE';
  for (const [key, value] of Object.entries(PLANS)) {
    if (value.priceId === priceId) {
      plan = key as PlanType;
      break;
    }
  }

  const status = subscription.status === 'active' ? 'ACTIVE' : 
                 subscription.status === 'past_due' ? 'PAST_DUE' :
                 subscription.status === 'canceled' ? 'CANCELLED' : 'INACTIVE';

  await prisma.subscription.update({
    where: { workspaceId },
    data: {
      plan,
      status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      creditsIncluded: PLANS[plan].credits,
      creditsUsed: 0,
    },
  });
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const workspaceId = subscription.metadata.workspaceId;

  if (!workspaceId) return;

  const priceId = subscription.items.data[0]?.price.id;
  let plan: PlanType = 'FREE';
  for (const [key, value] of Object.entries(PLANS)) {
    if (value.priceId === priceId) {
      plan = key as PlanType;
      break;
    }
  }

  await prisma.subscription.update({
    where: { workspaceId },
    data: {
      creditsUsed: 0,
      creditsIncluded: PLANS[plan].credits,
    },
  });
}

export async function purchaseCredits(
  workspaceId: string,
  amount: number,
  paymentIntentId: string
) {
  const newBalance = await addCredits(
    workspaceId,
    amount,
    CreditType.PURCHASE,
    `Purchased ${amount} credits`,
    paymentIntentId
  );

  return newBalance;
}

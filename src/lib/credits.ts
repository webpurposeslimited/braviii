import { prisma } from './prisma';
import { CreditType } from '@prisma/client';

export async function getCreditsBalance(workspaceId: string): Promise<number> {
  const subscription = await prisma.subscription.findUnique({
    where: { workspaceId },
  });

  if (!subscription) {
    return 0;
  }

  return subscription.creditsIncluded - subscription.creditsUsed + subscription.creditsExtra;
}

export async function hasEnoughCredits(
  workspaceId: string,
  amount: number
): Promise<boolean> {
  const balance = await getCreditsBalance(workspaceId);
  return balance >= amount;
}

export async function useCredits(
  workspaceId: string,
  amount: number,
  description: string,
  reference?: string
): Promise<{ success: boolean; balance: number }> {
  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({
      where: { workspaceId },
    });

    if (!subscription) {
      throw new Error('No subscription found');
    }

    const currentBalance =
      subscription.creditsIncluded -
      subscription.creditsUsed +
      subscription.creditsExtra;

    if (currentBalance < amount) {
      return { success: false, balance: currentBalance };
    }

    await tx.subscription.update({
      where: { workspaceId },
      data: {
        creditsUsed: { increment: amount },
      },
    });

    const newBalance = currentBalance - amount;

    await tx.creditsLedger.create({
      data: {
        workspaceId,
        type: CreditType.USAGE,
        amount: -amount,
        balance: newBalance,
        description,
        reference,
      },
    });

    return { success: true, balance: newBalance };
  });
}

export async function addCredits(
  workspaceId: string,
  amount: number,
  type: CreditType,
  description: string,
  reference?: string
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { workspaceId },
      data: {
        creditsExtra: { increment: amount },
      },
    });

    const newBalance =
      subscription.creditsIncluded -
      subscription.creditsUsed +
      subscription.creditsExtra;

    await tx.creditsLedger.create({
      data: {
        workspaceId,
        type,
        amount,
        balance: newBalance,
        description,
        reference,
      },
    });

    return newBalance;
  });
}

export async function getCreditsHistory(
  workspaceId: string,
  limit = 50,
  offset = 0
) {
  return prisma.creditsLedger.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

export const CREDIT_COSTS = {
  EMAIL_VERIFICATION: 1,
  DOMAIN_ENRICHMENT: 2,
  PERSON_ENRICHMENT: 3,
  AI_OPENER: 1,
  APOLLO_SEARCH: 5,
  GOOGLE_MAPS_SEARCH: 3,
} as const;

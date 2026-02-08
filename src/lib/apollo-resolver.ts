import { prisma } from './prisma';
import { decrypt } from './encryption';
import { ApolloClient } from './integrations/apollo';

export interface ResolvedApolloCredential {
  apiKey: string;
  source: 'user' | 'tenant' | 'system';
  ownerId: string;
}

/**
 * Resolves Apollo credentials with priority:
 * 1) User-linked credentials
 * 2) Tenant/workspace default set by admin
 * 3) System default set by super admin
 */
export async function resolveApolloCredential(
  userId: string,
  workspaceId?: string
): Promise<ResolvedApolloCredential | null> {
  // 1. Check user-level credential
  const userCred = await prisma.apolloCredential.findFirst({
    where: { ownerType: 'USER', ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });

  if (userCred) {
    return {
      apiKey: decrypt(userCred.apiKey),
      source: 'user',
      ownerId: userId,
    };
  }

  // 2. Check tenant/workspace-level default
  if (workspaceId) {
    const tenantCred = await prisma.apolloCredential.findFirst({
      where: { ownerType: 'TENANT', ownerId: workspaceId, isDefault: true },
    });

    if (tenantCred) {
      return {
        apiKey: decrypt(tenantCred.apiKey),
        source: 'tenant',
        ownerId: workspaceId,
      };
    }
  }

  // 3. Check system-level default
  const systemCred = await prisma.apolloCredential.findFirst({
    where: { ownerType: 'SYSTEM', isDefault: true },
  });

  if (systemCred) {
    return {
      apiKey: decrypt(systemCred.apiKey),
      source: 'system',
      ownerId: systemCred.ownerId,
    };
  }

  return null;
}

/**
 * Creates an ApolloClient using the resolved credentials.
 * Falls back to workspace Integration table if no ApolloCredential found.
 */
export async function createResolvedApolloClient(
  userId: string,
  workspaceId: string
): Promise<ApolloClient | null> {
  const resolved = await resolveApolloCredential(userId, workspaceId);

  if (resolved) {
    // ApolloClient constructor expects encrypted key, but we already decrypted.
    // We need to pass the raw key directly — create a subclass or use a wrapper.
    return new RawKeyApolloClient(resolved.apiKey);
  }

  // Fallback: check old Integration table for backward compat
  const integration = await prisma.integration.findFirst({
    where: { workspaceId, type: 'APOLLO', status: 'ACTIVE' },
  });

  if (integration?.credentials) {
    try {
      const creds = JSON.parse(integration.credentials);
      if (creds.apiKey) {
        return new ApolloClient(creds.apiKey);
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * ApolloClient subclass that accepts a raw (already decrypted) API key.
 */
class RawKeyApolloClient extends ApolloClient {
  constructor(rawApiKey: string) {
    // Pass a dummy value to parent; override the key below
    super('');
    // Override the private apiKey directly
    (this as any).apiKey = rawApiKey;
  }
}

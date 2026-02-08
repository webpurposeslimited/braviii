import { auth } from './auth';

export interface UserContext {
  userId: string;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

/**
 * Single source of truth for user role/context.
 * Used in server components, API routes, and layouts.
 */
export async function getUserContext(): Promise<UserContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    userId: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? null,
    isSuperAdmin: (session.user as any).isSuperAdmin ?? false,
    isAdmin: (session.user as any).isSuperAdmin ?? false,
  };
}

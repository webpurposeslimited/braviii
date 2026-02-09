import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible auth config (no Prisma, no DB imports).
 * Used by middleware. Full config with adapter/providers is in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [], // Providers added in auth.ts (needs DB access)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = !!(auth?.user as any)?.isSuperAdmin;
      const { pathname } = nextUrl;

      const publicPaths = [
        '/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/invite',
        '/blog',
        '/docs',
        '/pricing',
        '/privacy',
        '/terms',
      ];

      const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
      );

      const isApiRoute = pathname.startsWith('/api/');
      const isStaticFile =
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/static/') ||
        pathname.includes('.');

      if (isStaticFile) return true;
      if (isApiRoute) return true;

      // Redirect authenticated users away from login/signup
      if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
        const dest = isAdmin ? '/admin' : '/dashboard';
        return Response.redirect(new URL(dest, nextUrl));
      }

      // Allow public paths for everyone (after the login redirect check above)
      if (isPublicPath) return true;

      // Block non-admin users from /admin routes
      if (isLoggedIn && !isAdmin && pathname.startsWith('/admin')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Unauthenticated users on protected routes → redirect to /login
      // with a RELATIVE callbackUrl (just the pathname) to avoid https:// absolute URLs
      if (!isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = (user as any).isSuperAdmin ?? false;
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).isSuperAdmin = token.isSuperAdmin ?? false;
      }
      return session;
    },
  },
};

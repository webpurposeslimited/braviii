import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible auth config (no Prisma, no DB imports).
 * Used by middleware. Full config with adapter/providers is in auth.ts.
 */
export const authConfig: NextAuthConfig = {
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
      if (isPublicPath) return true;

      // Redirect authenticated users away from login/signup
      if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Must be logged in for all other routes
      return isLoggedIn;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

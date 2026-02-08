import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

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
  '/api/auth',
  '/api/webhooks',
  '/api/health',
];

const adminPaths = ['/admin'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isApiRoute = pathname.startsWith('/api/');
  const isStaticFile =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.');

  if (isStaticFile) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isPublicPath && !isApiRoute) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/signup
  if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

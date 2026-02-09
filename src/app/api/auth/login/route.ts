import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { encode } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('[AUTH] No AUTH_SECRET or NEXTAUTH_SECRET set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isSecure = process.env.NEXTAUTH_URL?.startsWith('https://');
    console.log('[AUTH] NEXTAUTH_URL:', process.env.NEXTAUTH_URL, 'isSecure:', isSecure);

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.avatar,
      isSuperAdmin: user.isSuperAdmin ?? false,
      sub: user.id,
    };

    // NextAuth v5 beta.15 may use either "authjs" or "next-auth" prefix.
    // Set both cookie variants so the middleware can find the session regardless.
    const cookieOptions = {
      httpOnly: true,
      secure: !!isSecure,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    };

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        isSuperAdmin: user.isSuperAdmin ?? false,
      },
    });

    // Variant 1: authjs.session-token (newer NextAuth v5)
    const cookieName1 = isSecure ? '__Secure-authjs.session-token' : 'authjs.session-token';
    const token1 = await encode({ token: tokenPayload, secret, salt: cookieName1 });
    response.cookies.set(cookieName1, token1, cookieOptions);

    // Variant 2: next-auth.session-token (older NextAuth v5 beta)
    const cookieName2 = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
    const token2 = await encode({ token: tokenPayload, secret, salt: cookieName2 });
    response.cookies.set(cookieName2, token2, cookieOptions);

    console.log('[AUTH] Login API success for:', email, 'cookies set:', cookieName1, cookieName2);
    return response;
  } catch (error) {
    console.error('[AUTH] Login API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

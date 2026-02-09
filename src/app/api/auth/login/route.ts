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

    // Create JWT matching NextAuth's expected format
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('[AUTH] No AUTH_SECRET or NEXTAUTH_SECRET set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.avatar,
        isSuperAdmin: user.isSuperAdmin ?? false,
        sub: user.id,
      },
      secret,
      salt: 'authjs.session-token',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        isSuperAdmin: user.isSuperAdmin ?? false,
      },
    });

    // Set the session cookie — name must match what NextAuth reads
    const isSecure = process.env.NEXTAUTH_URL?.startsWith('https://');
    const cookieName = isSecure
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token';

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: !!isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    console.log('[AUTH] Login API success for:', email, 'cookie:', cookieName);
    return response;
  } catch (error) {
    console.error('[AUTH] Login API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

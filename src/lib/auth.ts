import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Login attempt for:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing email or password');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          console.log('[AUTH] No user found with email:', credentials.email);
          return null;
        }

        if (!user.passwordHash) {
          console.log('[AUTH] User found but no passwordHash set for:', credentials.email);
          return null;
        }

        console.log('[AUTH] User found, comparing password. Hash starts with:', user.passwordHash.substring(0, 10));

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        console.log('[AUTH] Password comparison result:', isValid);

        if (!isValid) {
          console.log('[AUTH] Invalid password for:', credentials.email);
          return null;
        }

        console.log('[AUTH] Login successful for:', credentials.email, 'id:', user.id);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          isSuperAdmin: user.isSuperAdmin,
        };
      },
    }),
  ],
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

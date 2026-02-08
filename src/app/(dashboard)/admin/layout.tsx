import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isSuperAdmin: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Allow super admins always; for others, check if they have any admin role
  if (!user.isSuperAdmin) {
    const hasAdminRole = await (prisma as any).userAdminRole.count({
      where: { userId: session.user.id },
    });
    if (!hasAdminRole) {
      redirect('/dashboard');
    }
  }

  return <>{children}</>;
}

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = {
    id: session.user.id!,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    isSuperAdmin: (session.user as any).isSuperAdmin ?? false,
  };

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}

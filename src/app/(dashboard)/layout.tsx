import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#E8F5E9]">
      <div className="relative flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader user={session.user} />
          <main className="flex-1 overflow-y-auto bg-[#F0FAF0]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

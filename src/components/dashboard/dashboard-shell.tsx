'use client';

import { usePathname } from 'next/navigation';
import { DashboardSidebar } from './sidebar';
import { DashboardHeader } from './header';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';

interface DashboardShellProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isSuperAdmin?: boolean;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="relative flex h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader user={user} />
            <main className="flex-1 overflow-y-auto bg-slate-50">
              {children}
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative flex h-screen">
        <DashboardSidebar isSuperAdmin={user.isSuperAdmin} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader user={user} />
          <main className="flex-1 overflow-y-auto bg-slate-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

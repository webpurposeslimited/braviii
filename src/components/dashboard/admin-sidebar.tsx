'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Key,
  Package,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const adminNavItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Users & Roles', href: '/admin/users', icon: ShieldCheck },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Plans', href: '/admin/plans', icon: Package },
  { name: 'Sales', href: '/admin/sales', icon: TrendingUp },
  { name: 'Tickets', href: '/admin/tickets', icon: MessageSquare },
  { name: 'API Settings', href: '/admin/api-settings', icon: Key },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-slate-200">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 flex-shrink-0 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">B</span>
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="text-lg font-bold text-slate-900">Bravilio</span>
              <span className="text-[10px] font-medium text-blue-600 -mt-1 uppercase tracking-wider">Admin Panel</span>
            </motion.div>
          )}
        </Link>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
              )}
            >
              <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-blue-600' : 'text-slate-400')} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 py-4 px-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 flex-shrink-0 text-slate-400" />
          {!collapsed && <span>Back to Dashboard</span>}
        </Link>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-blue-600"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}

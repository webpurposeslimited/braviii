'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Database,
  Mail,
  CheckCircle,
  Workflow,
  Linkedin,
  BarChart3,
  Settings,
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const mainNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Companies', href: '/dashboard/companies', icon: Database },
  { name: 'Enrichment', href: '/dashboard/enrichment', icon: Workflow },
  { name: 'Verification', href: '/dashboard/verification', icon: CheckCircle },
  { name: 'Sequences', href: '/dashboard/sequences', icon: Mail },
  { name: 'LinkedIn Tasks', href: '/dashboard/linkedin', icon: Linkedin },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Support', href: '/dashboard/support', icon: MessageSquare },
];

const bottomNavItems = [
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Admin', href: '/admin', icon: Shield },
  { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
];

export function DashboardSidebar() {
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
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 flex-shrink-0 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">B</span>
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-black"
            >
              Bravilio
            </motion.span>
          )}
        </Link>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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

      <div className="border-t border-slate-200 py-4 px-3 space-y-0.5">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
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

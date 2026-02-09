'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ChevronRight,
  Home,
  Users,
  Building2,
  Briefcase,
  MapPin,
  Zap,
  Play,
  Sparkles,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const findLeadsSubmenu = [
  { name: 'Find people', href: '/dashboard/find-leads/people', icon: Users },
  { name: 'Find companies', href: '/dashboard/find-leads/companies', icon: Building2 },
  { name: 'Find jobs', href: '/dashboard/find-leads/jobs', icon: Briefcase },
  { name: 'Find local businesses', href: '/dashboard/find-leads/local-businesses', icon: MapPin },
];

interface DashboardSidebarProps {
  isSuperAdmin?: boolean;
}

export function DashboardSidebar({ isSuperAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [findLeadsOpen, setFindLeadsOpen] = useState(
    pathname.startsWith('/dashboard/find-leads')
  );

  const isHome = pathname === '/dashboard';
  const isFindLeads = pathname.startsWith('/dashboard/find-leads');
  const isSignals = pathname === '/dashboard/signals';
  const isCampaigns = pathname.startsWith('/dashboard/campaigns');
  const isBravigents = pathname.startsWith('/dashboard/bravigents');

  return (
    <aside className="flex flex-col h-full w-[220px] bg-white border-r border-gray-200 flex-shrink-0">
      <div className="flex items-center h-14 px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-7 w-7 flex-shrink-0 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <span className="text-[17px] font-semibold text-gray-900 tracking-tight">
            Bravilio
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {/* Home */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors',
            isHome
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <Home className={cn('h-[18px] w-[18px]', isHome ? 'text-gray-700' : 'text-gray-400')} />
          <span>Home</span>
        </Link>

        {/* Find Leads - expandable */}
        <div>
          <button
            onClick={() => setFindLeadsOpen(!findLeadsOpen)}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors',
              isFindLeads
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <div className="flex items-center gap-3">
              <Users className={cn('h-[18px] w-[18px]', isFindLeads ? 'text-gray-700' : 'text-gray-400')} />
              <span>Find Leads</span>
            </div>
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 text-gray-400 transition-transform duration-200',
                findLeadsOpen && 'rotate-90'
              )}
            />
          </button>
          {findLeadsOpen && (
            <div className="ml-5 mt-0.5 space-y-0.5 border-l border-gray-200 pl-3">
              {findLeadsSubmenu.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors',
                      isActive
                        ? 'text-gray-900 font-medium bg-gray-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="h-4 w-4 text-gray-400" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Signals */}
        <Link
          href="/dashboard/signals"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors',
            isSignals
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <Zap className={cn('h-[18px] w-[18px]', isSignals ? 'text-gray-700' : 'text-gray-400')} />
          <span>Signals</span>
        </Link>

        {/* Campaigns */}
        <Link
          href="/dashboard/campaigns"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors',
            isCampaigns
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <Play className={cn('h-[18px] w-[18px]', isCampaigns ? 'text-gray-700' : 'text-gray-400')} />
          <span>Campaigns</span>
        </Link>

        {/* Bravigents */}
        <Link
          href="/dashboard/bravigents"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors',
            isBravigents
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <Sparkles className={cn('h-[18px] w-[18px]', isBravigents ? 'text-gray-700' : 'text-gray-400')} />
          <span>Bravigents</span>
        </Link>
      </nav>

      {isSuperAdmin && (
        <div className="border-t border-gray-200 py-3 px-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Shield className="h-[18px] w-[18px] text-gray-400" />
            <span>Admin Panel</span>
          </Link>
        </div>
      )}
    </aside>
  );
}

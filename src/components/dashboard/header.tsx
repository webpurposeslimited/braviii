'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Bell,
  Search,
  Plus,
  ChevronDown,
  LogOut,
  Settings,
  User,
  CreditCard,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspaceStore } from '@/hooks/use-workspace';

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const { currentWorkspace, workspaces, switchWorkspace } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="search"
              placeholder="Search leads, campaigns..."
              className="pl-10 bg-neutral-50 border-neutral-200 text-black placeholder:text-neutral-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 text-neutral-600 hover:text-black hover:bg-neutral-100">
                <Building className="h-4 w-4 text-neutral-400" />
                <span className="max-w-[150px] truncate">
                  {currentWorkspace?.name || 'Select Workspace'}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-white border-neutral-200">
              <DropdownMenuLabel className="text-black">Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-200" />
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => switchWorkspace(workspace.id)}
                  className="text-neutral-600 hover:bg-neutral-100 hover:text-black"
                >
                  <Building className="mr-2 h-4 w-4 text-neutral-400" />
                  {workspace.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-neutral-200" />
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/settings?tab=workspace')}
                className="text-neutral-600 hover:bg-neutral-100 hover:text-black"
              >
                <Plus className="mr-2 h-4 w-4 text-neutral-400" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
            <Plus className="h-4 w-4" />
            Add Leads
          </Button>

          <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:text-black hover:bg-neutral-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 hover:bg-neutral-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-neutral-200">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-black">{user.name}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-200" />
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/settings?tab=profile')}
                className="text-neutral-600 hover:bg-neutral-100 hover:text-black"
              >
                <User className="mr-2 h-4 w-4 text-neutral-400" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/billing')}
                className="text-neutral-600 hover:bg-neutral-100 hover:text-black"
              >
                <CreditCard className="mr-2 h-4 w-4 text-neutral-400" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/settings')}
                className="text-neutral-600 hover:bg-neutral-100 hover:text-black"
              >
                <Settings className="mr-2 h-4 w-4 text-neutral-400" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-200" />
              <DropdownMenuItem onClick={handleSignOut} className="text-neutral-600 hover:bg-neutral-100 hover:text-black">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

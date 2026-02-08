'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-medium text-slate-300">Administration</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 hover:bg-slate-800">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || undefined} alt={user.name || 'Admin'} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-slate-300">{user.name || 'Admin'}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={() => router.push('/admin/users')}
                className="text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
              >
                <User className="mr-2 h-4 w-4 text-slate-500" />
                Manage Users
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/admin/api-settings')}
                className="text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
              >
                <Settings className="mr-2 h-4 w-4 text-slate-500" />
                API Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
              >
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

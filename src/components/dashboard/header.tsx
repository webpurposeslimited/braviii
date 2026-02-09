'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Bell,
  HelpCircle,
  Coins,
  Sparkles,
  LogOut,
  Settings,
  User,
  CreditCard,
  Building,
  ChevronDown,
  Plus,
  MessageSquare,
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
    <header className="h-12 border-b border-gray-200 bg-white flex-shrink-0">
      <div className="flex items-center justify-between h-full px-4">
        <div />

        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => router.push('/dashboard/billing')}
            size="sm"
            className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-3 rounded-md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Upgrade your plan
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-[13px] px-2.5"
          >
            <Coins className="h-4 w-4 text-green-600" />
            Credits
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Button>

          {/* User + Workspace dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 ml-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-[13px] font-medium text-gray-900 leading-tight">{user.name || 'User'}</p>
                  <p className="text-[11px] text-gray-500 leading-tight">
                    {currentWorkspace?.name || 'No workspace'}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 bg-white border-gray-200">
              <DropdownMenuLabel className="pb-0">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 font-normal">{user.email}</p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuLabel className="text-xs text-gray-400 font-normal py-1">
                Workspaces
              </DropdownMenuLabel>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => switchWorkspace(ws.id)}
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-[13px]"
                >
                  <Building className="mr-2 h-4 w-4 text-gray-400" />
                  <span className={ws.id === currentWorkspace?.id ? 'font-medium' : ''}>
                    {ws.name}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings?tab=workspace')}
                className="text-gray-500 hover:bg-gray-50 hover:text-gray-900 text-[13px]"
              >
                <Plus className="mr-2 h-4 w-4 text-gray-400" />
                Create workspace
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings?tab=profile')}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-[13px]"
              >
                <User className="mr-2 h-4 w-4 text-gray-400" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-[13px]"
              >
                <Settings className="mr-2 h-4 w-4 text-gray-400" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/billing')}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-[13px]"
              >
                <CreditCard className="mr-2 h-4 w-4 text-gray-400" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/support')}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-[13px]"
              >
                <MessageSquare className="mr-2 h-4 w-4 text-gray-400" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-[13px]"
              >
                <LogOut className="mr-2 h-4 w-4 text-gray-400" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

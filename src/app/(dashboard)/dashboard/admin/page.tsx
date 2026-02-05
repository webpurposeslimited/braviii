'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  CreditCard,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Ban,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  TrendingUp,
  Server,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const adminStats = {
  totalWorkspaces: 156,
  activeUsers: 423,
  totalCreditsUsed: 245000,
  activeJobs: 12,
  failedJobs: 3,
  pendingJobs: 8,
};

const recentWorkspaces = [
  { id: '1', name: 'TechCorp Inc', slug: 'techcorp', users: 12, creditsUsed: 5400, plan: 'Professional', status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: 'StartupXYZ', slug: 'startupxyz', users: 5, creditsUsed: 1200, plan: 'Starter', status: 'active', createdAt: '2024-01-18' },
  { id: '3', name: 'Enterprise Co', slug: 'enterprise', users: 45, creditsUsed: 28000, plan: 'Enterprise', status: 'active', createdAt: '2024-01-10' },
  { id: '4', name: 'Demo Account', slug: 'demo', users: 1, creditsUsed: 50, plan: 'Free', status: 'suspended', createdAt: '2024-01-20' },
  { id: '5', name: 'Growth Agency', slug: 'growth', users: 8, creditsUsed: 3200, plan: 'Professional', status: 'active', createdAt: '2024-01-12' },
];

const recentUsers = [
  { id: '1', name: 'John Smith', email: 'john@techcorp.com', workspace: 'TechCorp Inc', role: 'Owner', lastActive: '5 min ago', status: 'online' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@startupxyz.com', workspace: 'StartupXYZ', role: 'Admin', lastActive: '1 hour ago', status: 'offline' },
  { id: '3', name: 'Mike Wilson', email: 'mike@enterprise.com', workspace: 'Enterprise Co', role: 'Member', lastActive: '2 hours ago', status: 'offline' },
  { id: '4', name: 'Emily Davis', email: 'emily@growth.io', workspace: 'Growth Agency', role: 'Owner', lastActive: '30 min ago', status: 'online' },
];

const backgroundJobs = [
  { id: 'job_1', type: 'bulk_verification', workspace: 'TechCorp Inc', status: 'processing', progress: 65, total: 1000, processed: 650, createdAt: '10 min ago' },
  { id: 'job_2', type: 'enrichment', workspace: 'Enterprise Co', status: 'completed', progress: 100, total: 500, processed: 500, createdAt: '1 hour ago' },
  { id: 'job_3', type: 'bulk_verification', workspace: 'Growth Agency', status: 'failed', progress: 45, total: 200, processed: 90, error: 'Rate limit exceeded', createdAt: '2 hours ago' },
  { id: 'job_4', type: 'email_sending', workspace: 'StartupXYZ', status: 'pending', progress: 0, total: 150, processed: 0, createdAt: '5 min ago' },
];

const planColors: Record<string, string> = {
  Free: 'bg-slate-100 text-slate-700',
  Starter: 'bg-blue-100 text-blue-700',
  Professional: 'bg-purple-100 text-purple-700',
  Enterprise: 'bg-amber-100 text-amber-700',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
};

const jobStatusColors: Record<string, { bg: string; text: string; icon: any }> = {
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: RefreshCw },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  failed: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
};

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage workspaces, users, credits, and system jobs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Workspace
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{adminStats.totalWorkspaces}</p>
                  <p className="text-sm text-slate-500">Workspaces</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{adminStats.activeUsers}</p>
                  <p className="text-sm text-slate-500">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{(adminStats.totalCreditsUsed / 1000).toFixed(0)}K</p>
                  <p className="text-sm text-slate-500">Credits Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-50">
                  <Activity className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{adminStats.activeJobs}</p>
                  <p className="text-sm text-slate-500">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{adminStats.pendingJobs}</p>
                  <p className="text-sm text-slate-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{adminStats.failedJobs}</p>
                  <p className="text-sm text-slate-500">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="workspaces" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1 shadow-sm">
          <TabsTrigger value="workspaces" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
            <Building2 className="mr-2 h-4 w-4" />
            Workspaces
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
            <Server className="mr-2 h-4 w-4" />
            Background Jobs
          </TabsTrigger>
          <TabsTrigger value="credits" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
            <CreditCard className="mr-2 h-4 w-4" />
            Credits
          </TabsTrigger>
        </TabsList>

        {/* Workspaces Tab */}
        <TabsContent value="workspaces">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">All Workspaces</CardTitle>
                  <CardDescription>Manage workspace accounts and subscriptions</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search workspaces..."
                      className="pl-10 w-64 bg-white border-slate-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" className="border-slate-200">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Workspace</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Users</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Plan</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Credits Used</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Created</th>
                      <th className="p-4 text-right text-sm font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWorkspaces.map((workspace, index) => (
                      <motion.tr
                        key={workspace.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-900">{workspace.name}</p>
                            <p className="text-sm text-slate-500">/{workspace.slug}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-700">{workspace.users}</span>
                        </td>
                        <td className="p-4">
                          <Badge className={planColors[workspace.plan]}>{workspace.plan}</Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-700">{workspace.creditsUsed.toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <Badge className={statusColors[workspace.status]}>{workspace.status}</Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-slate-500">{workspace.createdAt}</span>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-200">
                              <DropdownMenuItem className="text-slate-700">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-slate-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-slate-700">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Adjust Credits
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-amber-600">
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">All Users</CardTitle>
                  <CardDescription>Manage user accounts across all workspaces</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search users..." className="pl-10 w-64 bg-white border-slate-200" />
                  </div>
                  <Button variant="outline" size="icon" className="border-slate-200">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-4 text-left text-sm font-medium text-slate-500">User</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Workspace</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Role</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Last Active</th>
                      <th className="p-4 text-right text-sm font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-700">{user.workspace}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="border-slate-200">{user.role}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${user.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span className="text-sm text-slate-600 capitalize">{user.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-slate-500">{user.lastActive}</span>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-200">
                              <DropdownMenuItem className="text-slate-700">
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-slate-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Ban className="mr-2 h-4 w-4" />
                                Disable Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background Jobs Tab */}
        <TabsContent value="jobs">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Background Jobs</CardTitle>
                  <CardDescription>Monitor and manage background processing jobs</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-slate-200">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Job ID</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Type</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Workspace</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Progress</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Created</th>
                      <th className="p-4 text-right text-sm font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backgroundJobs.map((job, index) => {
                      const statusConfig = jobStatusColors[job.status];
                      const StatusIcon = statusConfig.icon;
                      return (
                        <motion.tr
                          key={job.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="p-4">
                            <code className="text-sm font-mono text-slate-700">{job.id}</code>
                          </td>
                          <td className="p-4">
                            <span className="text-slate-700 capitalize">{job.type.replace('_', ' ')}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-slate-700">{job.workspace}</span>
                          </td>
                          <td className="p-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              <StatusIcon className={`h-3.5 w-3.5 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                              {job.status}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    job.status === 'failed' ? 'bg-red-500' :
                                    job.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${job.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-500">{job.processed}/{job.total}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-slate-500">{job.createdAt}</span>
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white border-slate-200">
                                <DropdownMenuItem className="text-slate-700">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {job.status === 'failed' && (
                                  <DropdownMenuItem className="text-blue-600">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Retry Job
                                  </DropdownMenuItem>
                                )}
                                {job.status === 'processing' && (
                                  <DropdownMenuItem className="text-amber-600">
                                    <Ban className="mr-2 h-4 w-4" />
                                    Cancel Job
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <div>
                <CardTitle className="text-slate-900">Credits Management</CardTitle>
                <CardDescription>Adjust and manage workspace credits</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-slate-900">2.4M</p>
                        <p className="text-sm text-slate-500">Total Credits Issued</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-slate-900">245K</p>
                        <p className="text-sm text-slate-500">Credits Used (30d)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-100">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-slate-900">$12.4K</p>
                        <p className="text-sm text-slate-500">Revenue (30d)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Adjust Credits</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Workspace</label>
                    <Input placeholder="Select workspace..." className="bg-white border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                    <Input type="number" placeholder="1000" className="bg-white border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
                    <Input placeholder="Bonus credits, refund, etc." className="bg-white border-slate-200" />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Credits
                  </Button>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    Remove Credits
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

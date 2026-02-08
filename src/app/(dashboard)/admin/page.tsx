'use client';

import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  CreditCard,
  Settings,
  BarChart3,
  Key,
  Package,
  TrendingUp,
  Activity,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const adminSections = [
  {
    title: 'API Settings',
    description: 'Manage API keys, OAuth, SMTP, and AI model configuration',
    icon: Key,
    href: '/admin/api-settings',
    color: 'from-blue-500 to-cyan-500',
    stats: '8 integrations',
  },
  {
    title: 'Plans Management',
    description: 'Create and manage subscription plans and pricing',
    icon: Package,
    href: '/admin/plans',
    color: 'from-purple-500 to-pink-500',
    stats: '3 active plans',
  },
  {
    title: 'Sales Dashboard',
    description: 'Track revenue, conversions, and sales metrics',
    icon: TrendingUp,
    href: '/admin/sales',
    color: 'from-blue-500 to-cyan-500',
    stats: '$127.5k MRR',
  },
  {
    title: 'Clients Dashboard',
    description: 'Monitor and manage all client accounts',
    icon: Users,
    href: '/admin/clients',
    color: 'from-orange-500 to-red-500',
    stats: '755 clients',
  },
  {
    title: 'Support Tickets',
    description: 'Manage support tickets, assign agents, and respond',
    icon: MessageSquare,
    href: '/admin/tickets',
    color: 'from-sky-500 to-blue-600',
    stats: 'View all tickets',
  },
  {
    title: 'Admin Users',
    description: 'Manage admin accounts, roles, and permissions',
    icon: ShieldCheck,
    href: '/admin/users',
    color: 'from-indigo-500 to-purple-500',
    stats: 'RBAC management',
  },
];

const quickStats = [
  {
    name: 'Total Revenue',
    value: '$127,450',
    change: '+12.5%',
    icon: DollarSign,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Active Clients',
    value: '755',
    change: '+18%',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Monthly Transactions',
    value: '2,340',
    change: '+23.1%',
    icon: Activity,
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Credits Used',
    value: '245K',
    change: '+8.4%',
    icon: CreditCard,
    color: 'from-amber-500 to-orange-500',
  },
];

const recentActivity = [
  { type: 'plan', message: 'New Enterprise plan subscriber - Acme Corp', time: '5 min ago' },
  { type: 'api', message: 'API key updated - Stripe integration', time: '15 min ago' },
  { type: 'client', message: 'Trial converted to Professional - TechStart Inc', time: '1 hour ago' },
  { type: 'revenue', message: 'Monthly revenue milestone reached: $127k', time: '2 hours ago' },
  { type: 'plan', message: 'Plan pricing updated - Professional tier', time: '3 hours ago' },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-slate-500 mt-1">Manage your entire platform from one place</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-600">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.name}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Admin Sections</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            >
              <Link href={section.href}>
                <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color}`}>
                        <section.icon className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </div>
                    <CardTitle className="text-slate-900 mt-4">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-blue-600">{section.stats}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                  >
                    <p className="text-sm text-slate-700">{activity.message}</p>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.0 }}
        >
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white h-full">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-white/80">
                Common admin tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                <Link href="/admin/api-settings">
                  <Key className="mr-2 h-4 w-4" />
                  Configure API Keys
                </Link>
              </Button>
              <Button asChild className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                <Link href="/admin/plans">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Plans
                </Link>
              </Button>
              <Button asChild className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                <Link href="/admin/clients">
                  <Users className="mr-2 h-4 w-4" />
                  View All Clients
                </Link>
              </Button>
              <Button asChild className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                <Link href="/admin/sales">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Sales Reports
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

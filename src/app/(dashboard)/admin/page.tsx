'use client';

import { motion } from 'framer-motion';
import {
  Users,
  BarChart3,
  Key,
  Package,
  TrendingUp,
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
  },
  {
    title: 'Plans Management',
    description: 'Create and manage subscription plans and pricing',
    icon: Package,
    href: '/admin/plans',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Sales Dashboard',
    description: 'Track revenue, conversions, and sales metrics',
    icon: TrendingUp,
    href: '/admin/sales',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Clients Dashboard',
    description: 'Monitor and manage all client accounts',
    icon: Users,
    href: '/admin/clients',
    color: 'from-orange-500 to-red-500',
  },
  {
    title: 'Support Tickets',
    description: 'Manage support tickets, assign agents, and respond',
    icon: MessageSquare,
    href: '/admin/tickets',
    color: 'from-sky-500 to-blue-600',
  },
  {
    title: 'Admin Users',
    description: 'Manage admin accounts, roles, and permissions',
    icon: ShieldCheck,
    href: '/admin/users',
    color: 'from-indigo-500 to-purple-500',
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-slate-500 mt-1">Manage your entire platform from one place</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
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
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-white/80">
              Common admin tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

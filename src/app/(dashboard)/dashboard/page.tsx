'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  CheckCircle,
  Workflow,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const sections = [
  {
    title: 'Leads',
    description: 'Import and manage your leads',
    icon: Users,
    href: '/dashboard/leads',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Enrichment',
    description: 'Enrich lead data with company info',
    icon: Workflow,
    href: '/dashboard/enrichment',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Email Verification',
    description: 'Verify email addresses before sending',
    icon: CheckCircle,
    href: '/dashboard/verification',
    color: 'from-blue-500 to-teal-500',
  },
  {
    title: 'Sequences',
    description: 'Create and manage email sequences',
    icon: Mail,
    href: '/dashboard/sequences',
    color: 'from-sky-500 to-blue-600',
  },
  {
    title: 'Analytics',
    description: 'Track campaign performance',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'from-amber-500 to-orange-500',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Get started by choosing a section below.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, index) => (
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
                <CardContent>
                  <Button variant="outline" size="sm" className="border-slate-300">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

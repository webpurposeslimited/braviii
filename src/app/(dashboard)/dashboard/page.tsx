'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const stats = [
  {
    name: 'Total Leads',
    value: '12,847',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Emails Sent',
    value: '8,234',
    change: '+8.2%',
    trend: 'up',
    icon: Mail,
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Verified Emails',
    value: '6,521',
    change: '+15.3%',
    trend: 'up',
    icon: CheckCircle,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Reply Rate',
    value: '23.4%',
    change: '-2.1%',
    trend: 'down',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-500',
  },
];

const recentActivity = [
  { type: 'lead', message: 'Imported 250 leads from CSV', time: '5 min ago' },
  { type: 'email', message: 'Campaign "Q4 Outreach" sent to 150 leads', time: '15 min ago' },
  { type: 'verify', message: 'Verified 500 emails (485 valid)', time: '1 hour ago' },
  { type: 'enrich', message: 'Enriched 75 leads with company data', time: '2 hours ago' },
  { type: 'reply', message: '12 new replies received', time: '3 hours ago' },
];

const campaigns = [
  { name: 'Q4 Enterprise Outreach', sent: 450, delivered: 445, opened: 312, replied: 45, status: 'active' },
  { name: 'Product Launch', sent: 1200, delivered: 1180, opened: 756, replied: 89, status: 'active' },
  { name: 'Follow-up Sequence', sent: 320, delivered: 315, opened: 201, replied: 28, status: 'paused' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass">View Reports</Button>
          <Button variant="cyan">
            <Target className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card glass className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.name}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent-cyan" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <p className="text-sm text-white/80">{activity.message}</p>
                    <span className="text-xs text-white/40">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary-400" />
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign, index) => {
                  const openRate = Math.round((campaign.opened / campaign.delivered) * 100);
                  const replyRate = Math.round((campaign.replied / campaign.delivered) * 100);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{campaign.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            campaign.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <span className="text-xs text-white/40">{campaign.sent} sent</span>
                      </div>
                      <div className="flex gap-4 text-xs text-white/60">
                        <span>Open: {openRate}%</span>
                        <span>Reply: {replyRate}%</span>
                      </div>
                      <Progress value={openRate} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Credits Usage</CardTitle>
              <Button variant="outline" size="sm">
                Buy Credits
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Email Verifications</span>
                  <span className="text-white">2,450 / 5,000</span>
                </div>
                <Progress value={49} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Enrichments</span>
                  <span className="text-white">890 / 2,000</span>
                </div>
                <Progress value={44.5} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">AI Generation</span>
                  <span className="text-white">1,200 / 3,000</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

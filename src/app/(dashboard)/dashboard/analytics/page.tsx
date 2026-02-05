'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Mail,
  MousePointer,
  Reply,
  Users,
  Calendar,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const overviewStats = [
  {
    name: 'Emails Sent',
    value: '12,847',
    change: '+12.5%',
    trend: 'up',
    icon: Mail,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Open Rate',
    value: '68.2%',
    change: '+5.3%',
    trend: 'up',
    icon: MousePointer,
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Reply Rate',
    value: '8.4%',
    change: '-1.2%',
    trend: 'down',
    icon: Reply,
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'New Leads',
    value: '1,234',
    change: '+18.7%',
    trend: 'up',
    icon: Users,
    color: 'from-emerald-500 to-teal-500',
  },
];

const campaignPerformance = [
  { name: 'Q4 Enterprise Outreach', sent: 450, opened: 312, clicked: 89, replied: 45, bounced: 5 },
  { name: 'Product Launch', sent: 1200, opened: 864, clicked: 234, replied: 89, bounced: 20 },
  { name: 'Follow-up Sequence', sent: 320, opened: 198, clicked: 56, replied: 28, bounced: 5 },
  { name: 'Webinar Invitation', sent: 890, opened: 623, clicked: 178, replied: 67, bounced: 12 },
];

const weeklyData = [
  { day: 'Mon', sent: 245, opened: 167, replied: 21 },
  { day: 'Tue', sent: 312, opened: 213, replied: 28 },
  { day: 'Wed', sent: 289, opened: 198, replied: 24 },
  { day: 'Thu', sent: 356, opened: 245, replied: 32 },
  { day: 'Fri', sent: 278, opened: 189, replied: 19 },
  { day: 'Sat', sent: 89, opened: 56, replied: 8 },
  { day: 'Sun', sent: 45, opened: 32, replied: 4 },
];

export default function AnalyticsPage() {
  const maxSent = Math.max(...weeklyData.map(d => d.sent));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-white/60 mt-1">Track your outreach performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-40 bg-white/5 border-white/10">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="glass">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card glass>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
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
              <CardTitle className="text-white">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((day) => (
                  <div key={day.day} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60 w-12">{day.day}</span>
                      <div className="flex-1 mx-4">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full transition-all"
                            style={{ width: `${(day.sent / maxSent) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-white text-sm w-16 text-right">{day.sent} sent</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent-cyan" />
                  <span className="text-white/60">Emails Sent</span>
                </div>
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
              <CardTitle className="text-white">Deliverability Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Delivery Rate</span>
                    <span className="text-white">98.2%</span>
                  </div>
                  <Progress value={98.2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Open Rate</span>
                    <span className="text-white">68.2%</span>
                  </div>
                  <Progress value={68.2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Click Rate</span>
                    <span className="text-white">24.5%</span>
                  </div>
                  <Progress value={24.5} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Reply Rate</span>
                    <span className="text-white">8.4%</span>
                  </div>
                  <Progress value={8.4} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Bounce Rate</span>
                    <span className="text-red-400">1.8%</span>
                  </div>
                  <Progress value={1.8} className="h-2 [&>div]:bg-red-500" />
                </div>
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
            <CardTitle className="text-white">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-left text-sm font-medium text-white/60">Campaign</th>
                    <th className="p-4 text-right text-sm font-medium text-white/60">Sent</th>
                    <th className="p-4 text-right text-sm font-medium text-white/60">Opened</th>
                    <th className="p-4 text-right text-sm font-medium text-white/60">Clicked</th>
                    <th className="p-4 text-right text-sm font-medium text-white/60">Replied</th>
                    <th className="p-4 text-right text-sm font-medium text-white/60">Bounced</th>
                    <th className="p-4 text-right text-sm font-medium text-white/60">Open Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignPerformance.map((campaign) => {
                    const openRate = ((campaign.opened / campaign.sent) * 100).toFixed(1);
                    return (
                      <tr key={campaign.name} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4 text-sm text-white">{campaign.name}</td>
                        <td className="p-4 text-sm text-white/80 text-right">{campaign.sent}</td>
                        <td className="p-4 text-sm text-white/80 text-right">{campaign.opened}</td>
                        <td className="p-4 text-sm text-white/80 text-right">{campaign.clicked}</td>
                        <td className="p-4 text-sm text-emerald-400 text-right">{campaign.replied}</td>
                        <td className="p-4 text-sm text-red-400 text-right">{campaign.bounced}</td>
                        <td className="p-4 text-right">
                          <span className="text-sm text-white">{openRate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

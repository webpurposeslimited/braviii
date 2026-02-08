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

// TODO: Wire to real API
const overviewStats = [
  { name: 'Emails Sent', value: '--', change: '', trend: 'up', icon: Mail, color: 'bg-blue-50', iconColor: 'text-blue-600' },
  { name: 'Open Rate', value: '--', change: '', trend: 'up', icon: MousePointer, color: 'bg-purple-50', iconColor: 'text-purple-600' },
  { name: 'Reply Rate', value: '--', change: '', trend: 'up', icon: Reply, color: 'bg-orange-50', iconColor: 'text-orange-600' },
  { name: 'New Leads', value: '--', change: '', trend: 'up', icon: Users, color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
];

const campaignPerformance: any[] = [];

const weeklyData: any[] = [];

export default function AnalyticsPage() {
  const maxSent = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.sent)) : 1;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1">Track your outreach performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-40 bg-white border-slate-200">
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
          <Button variant="outline">
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
            <Card className="bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${stat.color}`}>
                    <stat.icon className={`h-5 w-5 ${(stat as any).iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
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
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.name}</p>
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
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((day) => (
                  <div key={day.day} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 w-12">{day.day}</span>
                      <div className="flex-1 mx-4">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${(day.sent / maxSent) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-slate-700 text-sm w-16 text-right">{day.sent} sent</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-slate-500">Emails Sent</span>
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
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Deliverability Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Delivery Rate</span>
                    <span className="text-slate-900">--</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Open Rate</span>
                    <span className="text-slate-900">--</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Click Rate</span>
                    <span className="text-slate-900">--</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Reply Rate</span>
                    <span className="text-slate-900">--</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Bounce Rate</span>
                    <span className="text-slate-500">--</span>
                  </div>
                  <Progress value={0} className="h-2" />
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
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Campaign</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Sent</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Opened</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Clicked</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Replied</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Bounced</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Open Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignPerformance.map((campaign) => {
                    const openRate = ((campaign.opened / campaign.sent) * 100).toFixed(1);
                    return (
                      <tr key={campaign.name} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4 text-sm text-slate-900">{campaign.name}</td>
                        <td className="p-4 text-sm text-slate-700 text-right">{campaign.sent}</td>
                        <td className="p-4 text-sm text-slate-700 text-right">{campaign.opened}</td>
                        <td className="p-4 text-sm text-slate-700 text-right">{campaign.clicked}</td>
                        <td className="p-4 text-sm text-blue-600 text-right">{campaign.replied}</td>
                        <td className="p-4 text-sm text-red-500 text-right">{campaign.bounced}</td>
                        <td className="p-4 text-right">
                          <span className="text-sm text-slate-900">{openRate}%</span>
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

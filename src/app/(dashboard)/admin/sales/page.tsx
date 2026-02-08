'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const salesStats = [
  {
    name: 'Total Revenue',
    value: '$127,450',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'New Customers',
    value: '145',
    change: '+23.1%',
    trend: 'up',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Avg Deal Size',
    value: '$879',
    change: '+8.4%',
    trend: 'up',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Churn Rate',
    value: '2.3%',
    change: '-0.8%',
    trend: 'down',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-500',
  },
];

const recentSales = [
  {
    customer: 'Acme Corp',
    plan: 'Enterprise',
    amount: '$499',
    date: '2 hours ago',
    status: 'completed',
  },
  {
    customer: 'TechStart Inc',
    plan: 'Professional',
    amount: '$149',
    date: '5 hours ago',
    status: 'completed',
  },
  {
    customer: 'Global Solutions',
    plan: 'Professional',
    amount: '$149',
    date: '1 day ago',
    status: 'completed',
  },
  {
    customer: 'Innovation Labs',
    plan: 'Starter',
    amount: '$49',
    date: '1 day ago',
    status: 'completed',
  },
  {
    customer: 'Digital Ventures',
    plan: 'Enterprise',
    amount: '$499',
    date: '2 days ago',
    status: 'completed',
  },
];

const monthlyRevenue = [
  { month: 'Jan', revenue: 98500 },
  { month: 'Feb', revenue: 105200 },
  { month: 'Mar', revenue: 112800 },
  { month: 'Apr', revenue: 118300 },
  { month: 'May', revenue: 124700 },
  { month: 'Jun', revenue: 127450 },
];

const planBreakdown = [
  { plan: 'Starter', subscribers: 145, revenue: 7105, percentage: 24 },
  { plan: 'Professional', subscribers: 523, revenue: 77927, percentage: 61 },
  { plan: 'Enterprise', subscribers: 87, revenue: 43413, percentage: 15 },
];

export default function SalesDashboardPage() {
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Sales Dashboard</h1>
        <p className="text-neutral-600 mt-1">Track revenue, customers, and sales performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {salesStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-white border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-blue-600' : 'text-red-600'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-black">{stat.value}</p>
                  <p className="text-sm text-neutral-600">{stat.name}</p>
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
          <Card className="bg-white border-neutral-200">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Monthly Revenue Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyRevenue.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 font-medium">{data.month}</span>
                      <span className="text-black font-bold">${(data.revenue / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
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
          <Card className="bg-white border-neutral-200">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSales.map((sale, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-black">{sale.customer}</p>
                      <p className="text-sm text-neutral-600">{sale.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black">{sale.amount}</p>
                      <p className="text-xs text-neutral-500">{sale.date}</p>
                    </div>
                  </div>
                ))}
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
        <Card className="bg-white border-neutral-200">
          <CardHeader>
            <CardTitle className="text-black">Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {planBreakdown.map((plan, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black">{plan.plan}</p>
                      <p className="text-sm text-neutral-600">{plan.subscribers} subscribers</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black">${plan.revenue.toLocaleString()}</p>
                      <p className="text-sm text-neutral-600">{plan.percentage}% of total</p>
                    </div>
                  </div>
                  <Progress value={plan.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <p className="font-medium text-black">This Month</p>
            </div>
            <p className="text-3xl font-bold text-black mb-1">$127.5k</p>
            <p className="text-sm text-neutral-600">Revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <p className="font-medium text-black">Active Customers</p>
            </div>
            <p className="text-3xl font-bold text-black mb-1">755</p>
            <p className="text-sm text-blue-600">+18% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-100">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <p className="font-medium text-black">Conversion Rate</p>
            </div>
            <p className="text-3xl font-bold text-black mb-1">24.5%</p>
            <p className="text-sm text-blue-600">+3.2% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

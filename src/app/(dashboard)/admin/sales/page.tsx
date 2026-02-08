'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SalesDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sales Dashboard</h1>
        <p className="text-slate-500 mt-1">Track revenue, customers, and sales performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Total Revenue', icon: DollarSign, color: 'from-blue-500 to-cyan-500' },
          { name: 'New Customers', icon: Users, color: 'from-blue-500 to-cyan-500' },
          { name: 'Avg Deal Size', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
          { name: 'Churn Rate', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
        ].map((stat, index) => (
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
                </div>
                <p className="text-2xl font-bold text-slate-900">--</p>
                <p className="text-sm text-slate-500">{stat.name}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Sales Data</CardTitle>
            <CardDescription>No sales data available yet. Data will appear here once transactions are processed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-slate-100 mb-4">
                <BarChart3 className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">Connect Stripe and start processing payments to see sales analytics.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

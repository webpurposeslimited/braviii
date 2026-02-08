'use client';

import { motion } from 'framer-motion';
import {
  CreditCard,
  Check,
  Zap,
  TrendingUp,
  Download,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// TODO: Wire to real billing API
const currentPlan = {
  name: 'No Plan',
  price: 0,
  period: 'month',
  renewsAt: '--',
};

const usageStats = {
  leads: { used: 0, limit: 0 },
  verifications: { used: 0, limit: 0 },
  sequences: { used: 0, limit: 0 },
  sendingAccounts: { used: 0, limit: 0 },
};

const creditHistory: any[] = [];

const plans = [
  {
    name: 'Starter',
    price: 49,
    current: false,
    features: ['1,000 leads/month', '500 verifications', '3 sequences', '1 sending account'],
  },
  {
    name: 'Professional',
    price: 149,
    current: true,
    popular: true,
    features: ['10,000 leads/month', '5,000 verifications', 'Unlimited sequences', '5 sending accounts', 'Apollo integration'],
  },
  {
    name: 'Enterprise',
    price: 399,
    current: false,
    features: ['Unlimited leads', '25,000 verifications', 'Unlimited sequences', 'Unlimited sending', 'All integrations', 'Dedicated support'],
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
          <p className="text-slate-500 mt-1">Manage your subscription and credits</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Invoices
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    Current Plan
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {currentPlan.name}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Manage Subscription</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-slate-900">${currentPlan.price}</span>
                <span className="text-slate-500">/{currentPlan.period}</span>
              </div>
              <p className="text-sm text-slate-500">
                Your plan renews on {currentPlan.renewsAt}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Credits Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-slate-900 mb-2">--</p>
              <p className="text-sm text-slate-500 mb-4">credits remaining</p>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Buy More Credits
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Usage This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Leads</span>
                <span className="text-slate-900">{usageStats.leads.used.toLocaleString()} / {usageStats.leads.limit.toLocaleString()}</span>
              </div>
              <Progress value={(usageStats.leads.used / usageStats.leads.limit) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Email Verifications</span>
                <span className="text-slate-900">{usageStats.verifications.used.toLocaleString()} / {usageStats.verifications.limit.toLocaleString()}</span>
              </div>
              <Progress value={(usageStats.verifications.used / usageStats.verifications.limit) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Active Sequences</span>
                <span className="text-slate-900">{usageStats.sequences.used} / Unlimited</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sending Accounts</span>
                <span className="text-slate-900">{usageStats.sendingAccounts.used} / {usageStats.sendingAccounts.limit}</span>
              </div>
              <Progress value={(usageStats.sendingAccounts.used / usageStats.sendingAccounts.limit) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Available Plans</CardTitle>
            <CardDescription>Choose the plan that fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-xl border ${
                    plan.current
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white">
                      Current Plan
                    </Badge>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="h-4 w-4 text-blue-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.current ? 'outline' : 'default'}
                    className={`w-full ${!plan.current ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Credit History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Date</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Description</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Amount</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {creditHistory.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 text-sm text-slate-500">{item.date}</td>
                      <td className="p-4 text-sm text-slate-900">{item.description}</td>
                      <td className={`p-4 text-sm text-right ${item.amount > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-slate-900 text-right">{item.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

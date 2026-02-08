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

const currentPlan = {
  name: 'Professional',
  price: 149,
  period: 'month',
  renewsAt: 'Feb 15, 2024',
};

const usageStats = {
  leads: { used: 4500, limit: 10000 },
  verifications: { used: 2450, limit: 5000 },
  sequences: { used: 8, limit: -1 },
  sendingAccounts: { used: 3, limit: 5 },
};

const creditHistory = [
  { date: 'Jan 20, 2024', type: 'usage', description: 'Email verification (250 emails)', amount: -250, balance: 2750 },
  { date: 'Jan 18, 2024', type: 'usage', description: 'Lead enrichment (45 leads)', amount: -135, balance: 3000 },
  { date: 'Jan 15, 2024', type: 'purchase', description: 'Monthly credits reset', amount: 5000, balance: 3135 },
  { date: 'Jan 12, 2024', type: 'usage', description: 'AI opener generation', amount: -50, balance: -1865 },
  { date: 'Jan 10, 2024', type: 'bonus', description: 'Referral bonus', amount: 500, balance: -1815 },
];

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Billing</h1>
          <p className="text-white/60 mt-1">Manage your subscription and credits</p>
        </div>
        <Button variant="glass">
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
          <Card glass>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    Current Plan
                    <Badge className="bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30">
                      {currentPlan.name}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </div>
                <Button variant="cyan">Manage Subscription</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">${currentPlan.price}</span>
                <span className="text-white/60">/{currentPlan.period}</span>
              </div>
              <p className="text-sm text-white/60">
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
          <Card glass>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent-cyan" />
                Credits Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white mb-2">2,450</p>
              <p className="text-sm text-white/60 mb-4">credits remaining</p>
              <Button variant="glass" className="w-full">
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
        <Card glass>
          <CardHeader>
            <CardTitle className="text-white">Usage This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Leads</span>
                <span className="text-white">{usageStats.leads.used.toLocaleString()} / {usageStats.leads.limit.toLocaleString()}</span>
              </div>
              <Progress value={(usageStats.leads.used / usageStats.leads.limit) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Email Verifications</span>
                <span className="text-white">{usageStats.verifications.used.toLocaleString()} / {usageStats.verifications.limit.toLocaleString()}</span>
              </div>
              <Progress value={(usageStats.verifications.used / usageStats.verifications.limit) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Active Sequences</span>
                <span className="text-white">{usageStats.sequences.used} / Unlimited</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Sending Accounts</span>
                <span className="text-white">{usageStats.sendingAccounts.used} / {usageStats.sendingAccounts.limit}</span>
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
        <Card glass>
          <CardHeader>
            <CardTitle className="text-white">Available Plans</CardTitle>
            <CardDescription>Choose the plan that fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-xl border ${
                    plan.current
                      ? 'border-accent-cyan bg-accent-cyan/5'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-cyan text-white">
                      Current Plan
                    </Badge>
                  )}
                  <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-white/60">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-white/80">
                        <Check className="h-4 w-4 text-accent-cyan" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.current ? 'glass' : 'cyan'}
                    className="w-full"
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
        <Card glass>
          <CardHeader>
            <CardTitle className="text-white">Credit History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-left text-sm font-medium text-white/60">Date</th>
                    <th className="p-4 text-left text-sm font-medium text-white/60">Description</th>
                    <th className="p-4 text-right text-sm font-medium text-white/60">Amount</th>
                    <th className="p-4 text-right text-sm font-medium text-white/60">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {creditHistory.map((item, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-sm text-white/60">{item.date}</td>
                      <td className="p-4 text-sm text-white">{item.description}</td>
                      <td className={`p-4 text-sm text-right ${item.amount > 0 ? 'text-blue-400' : 'text-white/80'}`}>
                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-white text-right">{item.balance.toLocaleString()}</td>
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

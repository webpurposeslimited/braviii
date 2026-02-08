'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Check, Zap, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkspaceStore } from '@/hooks/use-workspace';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string | null;
  features: string[];
  popular: boolean;
  active: boolean;
}

export default function BillingPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/plans');
      if (res.ok) {
        const j = await res.json();
        setPlans((j.data || []).filter((p: Plan) => p.active));
      }
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <p className="text-slate-500 mt-1">Manage your subscription and credits</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-white border-slate-200 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  Current Plan
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {currentWorkspace ? 'Free' : 'No Workspace'}
                  </Badge>
                </CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-slate-900">$0</span>
              <span className="text-slate-500">/month</span>
            </div>
            <p className="text-sm text-slate-500">
              {currentWorkspace ? 'Upgrade to a paid plan to unlock more features.' : 'Select a workspace in Settings first.'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Credits Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900 mb-2">0</p>
            <p className="text-sm text-slate-500 mb-4">credits remaining</p>
            <p className="text-xs text-slate-400">Credits system will be available with paid plans.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Available Plans</CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No plans available yet. Plans will appear here once the admin configures them.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.id}
                  className={`relative p-6 rounded-xl border ${plan.popular ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white">Popular</Badge>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-500">/{plan.interval}</span>
                  </div>
                  {plan.description && <p className="text-sm text-slate-500 mb-4">{plan.description}</p>}
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Upgrade
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

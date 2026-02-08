'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit, Trash2, Check, Settings, Zap, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  interval: string;
  description: string | null;
  features: string[];
  limitsJson: Record<string, number> | null;
  active: boolean;
  popular: boolean;
  sortOrder: number;
}

const defaultForm = {
  name: '', slug: '', price: 0, interval: 'month', description: '',
  features: '', limitsLeads: 0, limitsVerifications: 0, limitsSequences: 0, limitsSending: 0,
  active: true, popular: false,
};

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/plans');
      if (res.ok) {
        const j = await res.json();
        setPlans(j.data || []);
      }
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    const lim = (plan.limitsJson as Record<string, number>) || {};
    setForm({
      name: plan.name, slug: plan.slug, price: plan.price, interval: plan.interval,
      description: plan.description || '', features: plan.features.join('\n'),
      limitsLeads: lim.leads ?? 0, limitsVerifications: lim.verifications ?? 0,
      limitsSequences: lim.sequences ?? 0, limitsSending: lim.sendingAccounts ?? 0,
      active: plan.active, popular: plan.popular,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        price: form.price, interval: form.interval, description: form.description,
        features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
        limitsJson: {
          leads: form.limitsLeads, verifications: form.limitsVerifications,
          sequences: form.limitsSequences, sendingAccounts: form.limitsSending,
        },
        active: form.active, popular: form.popular,
      };

      const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : '/api/admin/plans';
      const method = editingPlan ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { setIsDialogOpen(false); fetchPlans(); }
      else { const err = await res.json(); alert(err.error || 'Failed'); }
    } catch {} finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' });
    fetchPlans();
  };

  const handleToggle = async (plan: Plan) => {
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !plan.active }),
    });
    fetchPlans();
  };

  const activePlans = plans.filter(p => p.active).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Plans Management</h1>
          <p className="text-slate-500 mt-1">Create and manage subscription plans</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Create Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50"><Settings className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{plans.length}</p>
                <p className="text-sm text-slate-500">Total Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50"><Zap className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activePlans}</p>
                <p className="text-sm text-slate-500">Active Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50"><Settings className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{plans.length - activePlans}</p>
                <p className="text-sm text-slate-500">Inactive Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : plans.length === 0 ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Settings className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No plans yet</h3>
            <p className="text-slate-500 mb-4">Create your first subscription plan.</p>
            <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Create Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const lim = (plan.limitsJson as Record<string, number>) || {};
            return (
              <Card key={plan.id} className={`bg-white border-2 ${plan.popular ? 'border-blue-500' : 'border-slate-200'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-slate-900 flex items-center gap-2">
                        {plan.name}
                        {plan.popular && <Badge className="bg-blue-600 text-white">Popular</Badge>}
                      </CardTitle>
                      {plan.description && <p className="text-sm text-slate-500 mt-1">{plan.description}</p>}
                    </div>
                    <Badge variant="outline" className={plan.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}>
                      {plan.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-500">/{plan.interval}</span>
                  </div>

                  {Object.keys(lim).length > 0 && (
                    <div className="space-y-1 text-sm text-slate-500">
                      {Object.entries(lim).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-medium text-slate-900">{v === -1 ? 'Unlimited' : v.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {plan.features.length > 0 && (
                    <ul className="space-y-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" /> {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <Button variant="outline" size="sm" onClick={() => openEdit(plan)} className="flex-1">
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggle(plan)} className="flex-1">
                      {plan.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(plan.id)} className="border-red-300 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>{editingPlan ? 'Update plan details' : 'Create a new subscription plan'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Plan Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 border-slate-200" placeholder="Professional" />
              </div>
              <div>
                <Label>Price (cents) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="mt-1 border-slate-200" placeholder="149" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 border-slate-200" placeholder="For growing teams..." />
            </div>
            <div>
              <Label>Features (one per line)</Label>
              <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm min-h-[80px]" placeholder="Advanced analytics&#10;Priority support" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Leads Limit</Label><Input type="number" value={form.limitsLeads} onChange={(e) => setForm({ ...form, limitsLeads: Number(e.target.value) })} className="mt-1 border-slate-200" placeholder="-1 unlimited" /></div>
              <div><Label>Verifications</Label><Input type="number" value={form.limitsVerifications} onChange={(e) => setForm({ ...form, limitsVerifications: Number(e.target.value) })} className="mt-1 border-slate-200" /></div>
              <div><Label>Sequences</Label><Input type="number" value={form.limitsSequences} onChange={(e) => setForm({ ...form, limitsSequences: Number(e.target.value) })} className="mt-1 border-slate-200" /></div>
              <div><Label>Sending Accounts</Label><Input type="number" value={form.limitsSending} onChange={(e) => setForm({ ...form, limitsSending: Number(e.target.value) })} className="mt-1 border-slate-200" /></div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving || !form.name} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

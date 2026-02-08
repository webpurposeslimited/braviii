'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  DollarSign,
  Users,
  Mail,
  Zap,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  limits: {
    leads: number;
    verifications: number;
    sequences: number;
    sendingAccounts: number;
  };
  active: boolean;
  popular: boolean;
  subscribers: number;
}

const initialPlans: Plan[] = [
  {
    id: '1',
    name: 'Starter',
    price: 49,
    interval: 'month',
    description: 'Perfect for individuals and small teams',
    features: ['Basic analytics', 'Email support', '1 sending account'],
    limits: {
      leads: 1000,
      verifications: 500,
      sequences: 2,
      sendingAccounts: 1,
    },
    active: true,
    popular: false,
    subscribers: 145,
  },
  {
    id: '2',
    name: 'Professional',
    price: 149,
    interval: 'month',
    description: 'For growing teams that need more power',
    features: ['Advanced analytics', 'Priority support', 'CRM integrations', 'API access'],
    limits: {
      leads: 10000,
      verifications: 5000,
      sequences: -1,
      sendingAccounts: 5,
    },
    active: true,
    popular: true,
    subscribers: 523,
  },
  {
    id: '3',
    name: 'Enterprise',
    price: 499,
    interval: 'month',
    description: 'For large organizations with custom needs',
    features: ['Custom analytics', 'Dedicated support', 'Advanced integrations', 'SSO & SAML'],
    limits: {
      leads: -1,
      verifications: -1,
      sequences: -1,
      sendingAccounts: -1,
    },
    active: true,
    popular: false,
    subscribers: 87,
  },
];

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<Partial<Plan>>({
    name: '',
    price: 0,
    interval: 'month',
    description: '',
    features: [],
    limits: {
      leads: 0,
      verifications: 0,
      sequences: 0,
      sendingAccounts: 0,
    },
    active: true,
    popular: false,
  });

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: 0,
      interval: 'month',
      description: '',
      features: [],
      limits: {
        leads: 0,
        verifications: 0,
        sequences: 0,
        sendingAccounts: 0,
      },
      active: true,
      popular: false,
    });
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setIsDialogOpen(true);
  };

  const handleSavePlan = () => {
    if (editingPlan) {
      setPlans(plans.map((p) => (p.id === editingPlan.id ? { ...formData, id: p.id } as Plan : p)));
    } else {
      const newPlan: Plan = {
        ...formData as Plan,
        id: String(Date.now()),
        subscribers: 0,
      };
      setPlans([...plans, newPlan]);
    }
    setIsDialogOpen(false);
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter((p) => p.id !== id));
    }
  };

  const togglePlanStatus = (id: string) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Plans Management</h1>
          <p className="text-neutral-600 mt-1">Create and manage subscription plans</p>
        </div>
        <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{plans.length}</p>
                <p className="text-sm text-neutral-600">Total Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">
                  {plans.reduce((sum, p) => sum + p.subscribers, 0)}
                </p>
                <p className="text-sm text-neutral-600">Total Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">
                  ${plans.reduce((sum, p) => sum + p.price * p.subscribers, 0).toLocaleString()}
                </p>
                <p className="text-sm text-neutral-600">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">
                  {plans.filter((p) => p.active).length}
                </p>
                <p className="text-sm text-neutral-600">Active Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-white border-2 ${plan.popular ? 'border-blue-500' : 'border-neutral-200'}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-black flex items-center gap-2">
                      {plan.name}
                      {plan.popular && (
                        <Badge className="bg-blue-600 text-white">Popular</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-neutral-600 mt-1">{plan.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      plan.active
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }
                  >
                    {plan.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-black">${plan.price}</span>
                    <span className="text-neutral-600">/{plan.interval}</span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{plan.subscribers} subscribers</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-black">Limits:</p>
                  <div className="space-y-1 text-sm text-neutral-600">
                    <div className="flex justify-between">
                      <span>Leads:</span>
                      <span className="font-medium text-black">
                        {plan.limits.leads === -1 ? 'Unlimited' : plan.limits.leads.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verifications:</span>
                      <span className="font-medium text-black">
                        {plan.limits.verifications === -1 ? 'Unlimited' : plan.limits.verifications.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sequences:</span>
                      <span className="font-medium text-black">
                        {plan.limits.sequences === -1 ? 'Unlimited' : plan.limits.sequences}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sending Accounts:</span>
                      <span className="font-medium text-black">
                        {plan.limits.sendingAccounts === -1 ? 'Unlimited' : plan.limits.sendingAccounts}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-black">Features:</p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-4 border-t border-neutral-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1 border-neutral-300"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePlanStatus(plan.id)}
                    className="flex-1 border-neutral-300"
                  >
                    {plan.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update plan details and limits' : 'Create a new subscription plan'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-black">Plan Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white border-neutral-200 mt-2"
                  placeholder="Professional"
                />
              </div>
              <div>
                <Label className="text-black">Price</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="bg-white border-neutral-200 mt-2"
                  placeholder="149"
                />
              </div>
            </div>

            <div>
              <Label className="text-black">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white border-neutral-200 mt-2"
                placeholder="For growing teams..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-black">Leads Limit</Label>
                <Input
                  type="number"
                  value={formData.limits?.leads}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limits: { ...formData.limits!, leads: Number(e.target.value) },
                    })
                  }
                  className="bg-white border-neutral-200 mt-2"
                  placeholder="-1 for unlimited"
                />
              </div>
              <div>
                <Label className="text-black">Verifications Limit</Label>
                <Input
                  type="number"
                  value={formData.limits?.verifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limits: { ...formData.limits!, verifications: Number(e.target.value) },
                    })
                  }
                  className="bg-white border-neutral-200 mt-2"
                  placeholder="-1 for unlimited"
                />
              </div>
              <div>
                <Label className="text-black">Sequences Limit</Label>
                <Input
                  type="number"
                  value={formData.limits?.sequences}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limits: { ...formData.limits!, sequences: Number(e.target.value) },
                    })
                  }
                  className="bg-white border-neutral-200 mt-2"
                  placeholder="-1 for unlimited"
                />
              </div>
              <div>
                <Label className="text-black">Sending Accounts</Label>
                <Input
                  type="number"
                  value={formData.limits?.sendingAccounts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limits: { ...formData.limits!, sendingAccounts: Number(e.target.value) },
                    })
                  }
                  className="bg-white border-neutral-200 mt-2"
                  placeholder="-1 for unlimited"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 border-neutral-300"
              >
                Cancel
              </Button>
              <Button onClick={handleSavePlan} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

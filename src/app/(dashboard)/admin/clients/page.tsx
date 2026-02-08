'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: string;
  status: 'active' | 'inactive' | 'trial';
  mrr: number;
  joinedDate: string;
  lastActive: string;
  leads: number;
  emailsSent: number;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@acmecorp.com',
    company: 'Acme Corp',
    plan: 'Enterprise',
    status: 'active',
    mrr: 499,
    joinedDate: '2024-01-15',
    lastActive: '2 hours ago',
    leads: 45230,
    emailsSent: 12400,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@techstart.io',
    company: 'TechStart Inc',
    plan: 'Professional',
    status: 'active',
    mrr: 149,
    joinedDate: '2024-02-20',
    lastActive: '1 day ago',
    leads: 18500,
    emailsSent: 8200,
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael@global.com',
    company: 'Global Solutions',
    plan: 'Professional',
    status: 'trial',
    mrr: 0,
    joinedDate: '2024-03-01',
    lastActive: '3 hours ago',
    leads: 2300,
    emailsSent: 450,
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@innovate.co',
    company: 'Innovation Labs',
    plan: 'Starter',
    status: 'active',
    mrr: 49,
    joinedDate: '2023-11-10',
    lastActive: '5 days ago',
    leads: 8900,
    emailsSent: 3200,
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david@digital.com',
    company: 'Digital Ventures',
    plan: 'Enterprise',
    status: 'inactive',
    mrr: 0,
    joinedDate: '2023-08-05',
    lastActive: '30 days ago',
    leads: 52100,
    emailsSent: 18900,
  },
];

export default function ClientsDashboardPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === 'active').length,
    trial: clients.filter((c) => c.status === 'trial').length,
    totalMrr: clients.reduce((sum, c) => sum + c.mrr, 0),
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || client.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'trial':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'inactive':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Clients Dashboard</h1>
        <p className="text-neutral-600 mt-1">Manage and monitor all your clients</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{stats.total}</p>
                <p className="text-sm text-neutral-600">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{stats.active}</p>
                <p className="text-sm text-neutral-600">Active Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{stats.trial}</p>
                <p className="text-sm text-neutral-600">Trial Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">${stats.totalMrr.toLocaleString()}</p>
                <p className="text-sm text-neutral-600">Total MRR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-neutral-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-black">All Clients</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search clients..."
                  className="pl-10 w-64 bg-white border-neutral-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-40 bg-white border-neutral-200">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-white border-neutral-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="p-4 text-left text-sm font-medium text-neutral-600">Client</th>
                  <th className="p-4 text-left text-sm font-medium text-neutral-600">Plan</th>
                  <th className="p-4 text-left text-sm font-medium text-neutral-600">Status</th>
                  <th className="p-4 text-left text-sm font-medium text-neutral-600">MRR</th>
                  <th className="p-4 text-left text-sm font-medium text-neutral-600">Usage</th>
                  <th className="p-4 text-left text-sm font-medium text-neutral-600">Last Active</th>
                  <th className="p-4 text-right text-sm font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            {client.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-black">{client.name}</p>
                          <p className="text-sm text-neutral-600">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {client.plan}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-black">${client.mrr}</p>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-neutral-700">{client.leads.toLocaleString()} leads</p>
                        <p className="text-neutral-500">{client.emailsSent.toLocaleString()} emails</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-neutral-600">{client.lastActive}</p>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Loader2, Building, CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ClientWorkspace {
  id: string;
  name: string;
  role: string;
  plan: string;
  status: string;
  leadsCount: number;
  membersCount: number;
}
interface Client {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  isSuperAdmin: boolean;
  createdAt: string;
  workspaces: ClientWorkspace[];
}

export default function ClientsDashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/admin/clients?${params}`);
      if (res.ok) {
        const j = await res.json();
        setClients(j.data?.clients || []);
        setTotal(j.data?.total || 0);
      }
    } catch {} finally { setIsLoading(false); }
  }, [page, searchQuery]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const getInitials = (n: string | null) => {
    if (!n) return 'U';
    return n.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalWorkspaces = clients.reduce((s, c) => s + c.workspaces.length, 0);
  const totalLeads = clients.reduce((s, c) => s + c.workspaces.reduce((ws, w) => ws + w.leadsCount, 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Clients Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage and monitor all registered users</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50"><Users className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{total}</p>
                <p className="text-sm text-slate-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50"><Building className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalWorkspaces}</p>
                <p className="text-sm text-slate-500">Total Workspaces</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50"><CheckCircle className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalLeads.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-slate-900">All Users ({total})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by name or email..." className="pl-10 w-72 bg-white border-slate-200"
                value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-4 text-left text-sm font-medium text-slate-500">User</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Workspaces</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Plan</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Leads</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">{getInitials(client.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{client.name || 'Unnamed'}</p>
                            <p className="text-xs text-slate-500">{client.email}</p>
                          </div>
                          {client.isSuperAdmin && (
                            <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]">Admin</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {client.workspaces.length === 0 ? (
                            <span className="text-xs text-slate-400">None</span>
                          ) : client.workspaces.map((ws) => (
                            <div key={ws.id} className="text-xs text-slate-700">{ws.name} <span className="text-slate-400">({ws.role})</span></div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        {client.workspaces.length > 0 ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            {client.workspaces[0].plan}
                          </Badge>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-700">
                          {client.workspaces.reduce((s, w) => s + w.leadsCount, 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-500">{new Date(client.createdAt).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {total > 50 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {page} of {Math.ceil(total / 50)}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  Trash2,
  Edit,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspaceStore } from '@/hooks/use-workspace';

interface Lead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  location: string | null;
  source: string | null;
  status: string;
  emailStatus: string | null;
  tags: string[];
  company: { id: string; name: string; domain: string | null } | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700 border-blue-200',
  CONTACTED: 'bg-purple-50 text-purple-700 border-purple-200',
  ENGAGED: 'bg-amber-50 text-amber-700 border-amber-200',
  QUALIFIED: 'bg-blue-50 text-blue-700 border-blue-200',
  CONVERTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UNQUALIFIED: 'bg-red-50 text-red-700 border-red-200',
  DO_NOT_CONTACT: 'bg-slate-100 text-slate-600 border-slate-200',
};

const emailStatusIcon = (status: string | null) => {
  switch (status) {
    case 'VALID': return <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />;
    case 'INVALID': return <XCircle className="h-3.5 w-3.5 text-red-500" />;
    case 'RISKY': return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
    default: return null;
  }
};

export default function LeadsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    location: '',
    source: 'manual',
  });

  const fetchLeads = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/leads?${params}`);
      if (res.ok) {
        const json = await res.json();
        setLeads(json.data || []);
        setTotal(json.pagination?.total || 0);
      }
    } catch (e) {
      console.error('Failed to fetch leads:', e);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id, page, searchQuery, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleCreate = async () => {
    if (!currentWorkspace?.id || !formData.firstName) return;
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = { firstName: formData.firstName, source: 'manual' };
      if (formData.lastName) body.lastName = formData.lastName;
      if (formData.email) body.email = formData.email;
      if (formData.phone) body.phone = formData.phone;
      if (formData.jobTitle) body.jobTitle = formData.jobTitle;

      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', location: '', source: 'manual' });
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create lead');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!currentWorkspace?.id) return;
    if (!confirm('Delete this lead?')) return;
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/leads/${leadId}`, { method: 'DELETE' });
      fetchLeads();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <Users className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-medium text-slate-900 mb-2">No workspace selected</h2>
        <p className="text-slate-500 mb-4">Create or select a workspace in Settings to manage leads.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
          <p className="text-slate-500 mt-1">{total} lead{total !== 1 ? 's' : ''} in workspace</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search leads..."
            className="pl-10 bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 bg-white border-slate-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="ENGAGED">Engaged</SelectItem>
            <SelectItem value="QUALIFIED">Qualified</SelectItem>
            <SelectItem value="CONVERTED">Converted</SelectItem>
            <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedLeads.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
          <span className="text-sm text-slate-700">{selectedLeads.length} selected</span>
          <Button variant="ghost" size="sm" className="ml-auto text-red-600" onClick={() => {
            selectedLeads.forEach((id) => handleDelete(id));
            setSelectedLeads([]);
          }}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : leads.length === 0 ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No leads yet</h3>
            <p className="text-slate-500 mb-4">Add your first lead to get started.</p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-4 text-left w-10">
                      <input type="checkbox" className="rounded border-slate-300"
                        checked={selectedLeads.length === leads.length && leads.length > 0}
                        onChange={() => setSelectedLeads(selectedLeads.length === leads.length ? [] : leads.map(l => l.id))}
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Name</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Contact</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Company</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Status</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <input type="checkbox" className="rounded border-slate-300"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleLeadSelection(lead.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {(lead.firstName?.[0] || '')}{(lead.lastName?.[0] || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">
                              {[lead.firstName, lead.lastName].filter(Boolean).join(' ') || '—'}
                            </p>
                            {lead.jobTitle && <p className="text-xs text-slate-500">{lead.jobTitle}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-sm">
                          {lead.email && (
                            <div className="flex items-center gap-1.5 text-slate-700">
                              {emailStatusIcon(lead.emailStatus)}
                              <Mail className="h-3 w-3 text-slate-400" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Phone className="h-3 w-3" /> {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {lead.company ? (
                          <div className="flex items-center gap-1.5 text-sm text-slate-700">
                            <Building className="h-3 w-3 text-slate-400" /> {lead.company.name}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={statusColors[lead.status] || 'bg-slate-50 text-slate-600'}>
                          {lead.status}
                        </Badge>
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
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(lead.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {total > 50 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {page} of {Math.ceil(total / 50)}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Add Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 bg-white border-slate-200" placeholder="John" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 bg-white border-slate-200" placeholder="Doe" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 bg-white border-slate-200" placeholder="john@company.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 bg-white border-slate-200" placeholder="+1 555-0100" />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="mt-1 bg-white border-slate-200" placeholder="CEO" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreate} disabled={isSaving || !formData.firstName}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Lead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

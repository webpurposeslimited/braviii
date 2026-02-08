'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, MoreHorizontal, Play, Pause, Trash2, Mail,
  Clock, Users, Loader2, Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspaceStore } from '@/hooks/use-workspace';

interface Sequence {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  _count: { steps: number; campaigns: number };
  campaigns: { totalLeads: number; sent: number; opened: number; replied: number; bounced: number }[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PAUSED: { label: 'Paused', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  ARCHIVED: { label: 'Archived', color: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export default function SequencesPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const fetchSequences = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/sequences`);
      if (res.ok) {
        const j = await res.json();
        setSequences(j.data || []);
        setTotal(j.pagination?.total || 0);
      }
    } catch (e) {
      console.error('Failed to fetch sequences:', e);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const handleCreate = async () => {
    if (!currentWorkspace?.id || !formName.trim()) return;
    setIsSaving(true);
    try {
      const body: Record<string, string> = { name: formName };
      if (formDesc) body.description = formDesc;
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/sequences`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setFormName('');
        setFormDesc('');
        fetchSequences();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create sequence');
      }
    } catch {} finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!currentWorkspace?.id || !confirm('Delete this sequence?')) return;
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/sequences/${id}`, { method: 'DELETE' });
      fetchSequences();
    } catch {}
  };

  const handleStatusChange = async (id: string, status: string) => {
    if (!currentWorkspace?.id) return;
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/sequences/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchSequences();
    } catch {}
  };

  const activeCount = sequences.filter(s => s.status === 'ACTIVE').length;
  const totalEnrolled = sequences.reduce((sum, s) => sum + s.campaigns.reduce((cs, c) => cs + c.totalLeads, 0), 0);

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <Workflow className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-medium text-slate-900 mb-2">No workspace selected</h2>
        <p className="text-slate-500 mb-4">Create or select a workspace in Settings to manage sequences.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Sequences</h1>
          <p className="text-slate-500 mt-1">Create and manage email sequences</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Sequence
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50"><Mail className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{total}</p>
                <p className="text-sm text-slate-500">Total Sequences</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50"><Play className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
                <p className="text-sm text-slate-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50"><Users className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalEnrolled}</p>
                <p className="text-sm text-slate-500">Total Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search sequences..." className="pl-10 bg-white border-slate-200"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : sequences.length === 0 ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Workflow className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No sequences yet</h3>
            <p className="text-slate-500 mb-4">Create your first sequence to start outreach.</p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> New Sequence
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sequences
            .filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((seq) => {
              const cfg = statusConfig[seq.status] || statusConfig.DRAFT;
              const enrolled = seq.campaigns.reduce((s, c) => s + c.totalLeads, 0);
              const sent = seq.campaigns.reduce((s, c) => s + c.sent, 0);
              const replied = seq.campaigns.reduce((s, c) => s + c.replied, 0);
              return (
                <Card key={seq.id} className="bg-white border-slate-200 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
                          {seq.name}
                          <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                        </CardTitle>
                        {seq.description && <p className="text-sm text-slate-500">{seq.description}</p>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {seq.status === 'ACTIVE' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(seq.id, 'PAUSED')}>
                              <Pause className="mr-2 h-4 w-4" /> Pause
                            </DropdownMenuItem>
                          ) : seq.status !== 'ARCHIVED' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(seq.id, 'ACTIVE')}>
                              <Play className="mr-2 h-4 w-4" /> Activate
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(seq.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {seq._count.steps} steps</div>
                      <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {enrolled} enrolled</div>
                      <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(seq.createdAt).toLocaleDateString()}</div>
                    </div>
                    {enrolled > 0 && (
                      <div className="flex gap-4 text-sm mt-3 pt-3 border-t border-slate-100">
                        <span className="text-slate-500">Sent: <strong className="text-slate-900">{sent}</strong></span>
                        <span className="text-slate-500">Replied: <strong className="text-slate-900">{replied}</strong></span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">New Sequence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Sequence Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)}
                className="mt-1 border-slate-200" placeholder="Welcome Sequence" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                className="mt-1 border-slate-200" placeholder="Follow up with new signups..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleCreate} disabled={isSaving || !formName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

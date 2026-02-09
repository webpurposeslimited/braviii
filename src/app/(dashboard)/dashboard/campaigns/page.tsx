'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Search,
  Plus,
  BarChart3,
  Mail,
  ShieldBan,
  MoreHorizontal,
  Pause,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspaceStore } from '@/hooks/use-workspace';

type TabId = 'sequences' | 'email-accounts' | 'blocklist';

const tabs: { id: TabId; label: string }[] = [
  { id: 'sequences', label: 'Sequences' },
  { id: 'email-accounts', label: 'Email accounts' },
  { id: 'blocklist', label: 'Global blocklist' },
];

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalLeads: number;
  sent: number;
  replied: number;
  bounced: number;
  createdAt: string;
  updatedAt: string;
}

interface SendingAccount {
  id: string;
  name: string;
  email: string;
  type: string;
  status: string;
  dailyLimit: number;
  sentToday: number;
}

interface BlocklistEntry {
  id: string;
  email: string;
  reason: string;
  createdAt: string;
}

export default function CampaignsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState<TabId>('sequences');
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<SendingAccount[]>([]);
  const [blocklist, setBlocklist] = useState<BlocklistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/sequences`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.data || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [currentWorkspace?.id]);

  const fetchAccounts = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/sending-accounts`);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.data || []);
      }
    } catch { /* silent */ }
  }, [currentWorkspace?.id]);

  const fetchBlocklist = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/blocklist`);
      if (res.ok) {
        const data = await res.json();
        setBlocklist(data.data || []);
      }
    } catch { /* silent */ }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchCampaigns();
    fetchAccounts();
    fetchBlocklist();
  }, [fetchCampaigns, fetchAccounts, fetchBlocklist]);

  const createCampaign = async () => {
    if (!currentWorkspace?.id) return;
    const now = new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/sequences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${now} New campaign` }),
      });
      if (res.ok) fetchCampaigns();
    } catch { /* silent */ }
  };

  const deleteCampaign = async (id: string) => {
    if (!currentWorkspace?.id) return;
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/sequences/${id}`, { method: 'DELETE' });
      fetchCampaigns();
    } catch { /* silent */ }
  };

  const replyRate = (c: Campaign) => c.sent > 0 ? `${((c.replied / c.sent) * 100).toFixed(0)}%` : '—';
  const bounceRate = (c: Campaign) => c.sent > 0 ? `${((c.bounced / c.sent) * 100).toFixed(0)}%` : '—';

  const statusLabel = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      DRAFT: { label: 'Draft', cls: 'bg-gray-100 text-gray-600' },
      ACTIVE: { label: 'Active', cls: 'bg-green-50 text-green-700' },
      PAUSED: { label: 'Paused', cls: 'bg-yellow-50 text-yellow-700' },
      ARCHIVED: { label: 'Archived', cls: 'bg-gray-100 text-gray-500' },
    };
    return map[s] || map.DRAFT;
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Play className="h-5 w-5 text-blue-600" />
          </div>
          <h1 className="text-[20px] font-semibold text-gray-900">Campaigns</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-48 pl-8 text-[13px] border-gray-200 bg-white"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-[13px] gap-1.5 border-gray-200">
            <Mail className="h-3.5 w-3.5" /> Global inbox
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[13px] gap-1.5 border-gray-200">
            <BarChart3 className="h-3.5 w-3.5" /> Global analytics
          </Button>
          <Button onClick={createCampaign} size="sm" className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] px-3">
            <Plus className="h-3.5 w-3.5" /> New campaign
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'sequences' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Name</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Status</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Leads</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Sent</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Reply rate</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Bounce rate</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Last modified</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400 mx-auto" /></td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[13px] text-gray-500">No campaigns yet. Click &quot;New campaign&quot; to get started.</td></tr>
              ) : (
                campaigns.map((c) => {
                  const st = statusLabel(c.status);
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4 text-gray-400" />
                          <span className="text-[13px] font-medium text-gray-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[13px] text-gray-500">{c.totalLeads || '—'}</td>
                      <td className="px-4 py-2.5 text-[13px] text-gray-500">{c.sent || '—'}</td>
                      <td className="px-4 py-2.5 text-[13px] text-gray-500">{replyRate(c)}</td>
                      <td className="px-4 py-2.5 text-[13px] text-gray-500">{bounceRate(c)}</td>
                      <td className="px-4 py-2.5 text-[13px] text-gray-500">
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-gray-100"><MoreHorizontal className="h-4 w-4 text-gray-400" /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200">
                            <DropdownMenuItem className="text-[13px]"><Pause className="mr-2 h-4 w-4" /> Pause</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteCampaign(c.id)} className="text-[13px] text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'email-accounts' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Name</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Email</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Type</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Status</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Daily limit</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Sent today</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-gray-500">No email accounts connected. Go to Settings to add one.</td></tr>
              ) : (
                accounts.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-[13px] font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{a.email}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500 uppercase">{a.type}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${a.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500">{a.dailyLimit}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500">{a.sentToday}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'blocklist' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <ShieldBan className="h-4 w-4 text-gray-400" />
            <span className="text-[13px] font-medium text-gray-700">Global blocklist</span>
            <span className="text-[12px] text-gray-400 ml-auto">{blocklist.length} entries</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Email</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Reason</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Added</th>
              </tr>
            </thead>
            <tbody>
              {blocklist.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-[13px] text-gray-500">No blocked emails.</td></tr>
              ) : (
                blocklist.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-[13px] text-gray-900">{b.email}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500 capitalize">{b.reason.toLowerCase().replace('_', ' ')}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

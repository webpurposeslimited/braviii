'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Search,
  Plus,
  RefreshCw,
  Briefcase,
  UserPlus,
  FileText,
  TrendingUp,
  Globe,
  Newspaper,
  Linkedin,
  Settings2,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
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

const signalTypes = [
  { type: 'JOB_CHANGE', label: 'Job change...', icon: RefreshCw, color: 'text-green-500 bg-green-50' },
  { type: 'NEW_HIRE', label: 'New hire...', icon: UserPlus, color: 'text-blue-500 bg-blue-50' },
  { type: 'JOB_POSTING', label: 'Job posting...', icon: FileText, color: 'text-orange-500 bg-orange-50' },
  { type: 'PROMOTION', label: 'Promotion...', icon: TrendingUp, color: 'text-red-500 bg-red-50' },
  { type: 'NEWS_FUNDRAISING', label: 'News & fundraising...', icon: Newspaper, color: 'text-purple-500 bg-purple-50' },
  { type: 'LINKEDIN_BRAND_MENTION', label: 'LinkedIn post brand mentions...', icon: Linkedin, color: 'text-sky-500 bg-sky-50' },
  { type: 'WEB_INTENT', label: 'Web intent...', icon: Globe, color: 'text-teal-500 bg-teal-50' },
  { type: 'CUSTOM', label: 'Custom...', icon: Settings2, color: 'text-gray-500 bg-gray-50' },
];

const quickStartCards = signalTypes.filter(s => !['CUSTOM', 'LINKEDIN_BRAND_MENTION'].includes(s.type));

interface Signal {
  id: string;
  name: string;
  type: string;
  status: string;
  frequency: string;
  folder: string | null;
  matchCount: number;
  createdAt: string;
}

export default function SignalsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSignals = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/signals`);
      if (res.ok) {
        const data = await res.json();
        setSignals(data.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => { fetchSignals(); }, [fetchSignals]);

  const createSignal = async (type: string, label: string) => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/signals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: label.replace('...', '').trim(), type, frequency: 'daily' }),
      });
      if (res.ok) fetchSignals();
    } catch {
      // silent
    }
  };

  const toggleSignal = async (id: string, currentStatus: string) => {
    if (!currentWorkspace?.id) return;
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/signals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchSignals();
    } catch {
      // silent
    }
  };

  const deleteSignal = async (id: string) => {
    if (!currentWorkspace?.id) return;
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/signals/${id}`, { method: 'DELETE' });
      fetchSignals();
    } catch {
      // silent
    }
  };

  const getTypeConfig = (type: string) => signalTypes.find(s => s.type === type) || signalTypes[signalTypes.length - 1];

  const filtered = signals.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
      {/* Quick start */}
      <div className="space-y-3">
        <p className="text-[13px] text-gray-500 font-medium">Quick start</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {quickStartCards.map((card) => (
            <button
              key={card.type}
              onClick={() => createSignal(card.type, card.label)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all flex-shrink-0"
            >
              <div className={`p-1.5 rounded-md ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-medium text-gray-700">{card.label.replace('...', '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Signals table header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-gray-700" />
          <h1 className="text-[18px] font-semibold text-gray-900">Signals</h1>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] px-3">
                <Plus className="h-3.5 w-3.5" />
                New signal
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white border-gray-200">
              {signalTypes.map((st) => (
                <DropdownMenuItem
                  key={st.type}
                  onClick={() => createSignal(st.type, st.label)}
                  className="text-[13px] text-gray-700 hover:bg-gray-50"
                >
                  {st.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Signals table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Name</th>
              <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Folder</th>
              <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Type</th>
              <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Frequency</th>
              <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Zap className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-[14px] text-blue-600">You haven&apos;t created any signals yet.</p>
                  <p className="text-[13px] text-gray-400 mt-1">Use quick start above or click &quot;New signal&quot;</p>
                </td>
              </tr>
            ) : (
              filtered.map((signal) => {
                const config = getTypeConfig(signal.type);
                return (
                  <tr key={signal.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1 rounded ${config.color}`}>
                          <config.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[13px] font-medium text-gray-900">{signal.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500">{signal.folder || '—'}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500">{config.label.replace('...', '')}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500 capitalize">{signal.frequency}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        signal.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {signal.status === 'ACTIVE' ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-gray-200">
                          <DropdownMenuItem onClick={() => toggleSignal(signal.id, signal.status)} className="text-[13px]">
                            {signal.status === 'ACTIVE' ? (
                              <><Pause className="mr-2 h-4 w-4" /> Pause</>
                            ) : (
                              <><Play className="mr-2 h-4 w-4" /> Resume</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteSignal(signal.id)} className="text-[13px] text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
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
    </div>
  );
}

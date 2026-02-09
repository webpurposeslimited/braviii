'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Upload,
  ArrowRight,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  ChevronDown,
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

interface Bravigent {
  id: string;
  name: string;
  prompt: string;
  model: string;
  version: number;
  tools: string[];
  status: string;
  createdAt: string;
  createdById: string | null;
}

export default function BravigentsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [agents, setAgents] = useState<Bravigent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [buildPrompt, setBuildPrompt] = useState('');

  const fetchAgents = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/bravigents`);
      if (res.ok) {
        const data = await res.json();
        setAgents(data.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const createAgent = async (name?: string, prompt?: string) => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/bravigents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || `Agent ${agents.length + 1}`,
          prompt: prompt || buildPrompt || 'New agent',
          model: 'auto',
        }),
      });
      if (res.ok) {
        setBuildPrompt('');
        fetchAgents();
      }
    } catch {
      // silent
    }
  };

  const toggleAgent = async (id: string, currentStatus: string) => {
    if (!currentWorkspace?.id) return;
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/bravigents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAgents();
    } catch {
      // silent
    }
  };

  const deleteAgent = async (id: string) => {
    if (!currentWorkspace?.id) return;
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/bravigents/${id}`, { method: 'DELETE' });
      fetchAgents();
    } catch {
      // silent
    }
  };

  const filtered = agents.filter(a =>
    !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-8">
      {/* Builder section */}
      <div className="space-y-4">
        <h1 className="text-[20px] font-semibold text-gray-900">
          Start building your Bravigent in natural language
        </h1>

        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
              <textarea
                value={buildPrompt}
                onChange={(e) => setBuildPrompt(e.target.value)}
                placeholder="Describe your task in natural language and we'll create an AI Agent for you... (Tip: Type '@' to mention files and business context)"
                className="flex-1 resize-none border-0 bg-transparent text-[14px] placeholder:text-gray-400 focus:outline-none min-h-[60px]"
                rows={2}
              />
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-[12px] gap-1.5 border-gray-200">
                <ChevronDown className="h-3 w-3" />
                Automatically assign model
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[12px] gap-1.5 border-gray-200">
                <Upload className="h-3 w-3" />
                Upload files
              </Button>
            </div>
            <Button
              onClick={() => buildPrompt && createAgent(undefined, buildPrompt)}
              disabled={!buildPrompt}
              size="sm"
              className="h-7 text-[12px] gap-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowRight className="h-3 w-3" />
              Build Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Agents table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-gray-700" />
            <h2 className="text-[18px] font-semibold text-gray-900">Bravigents</h2>
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
            <Button
              onClick={() => createAgent()}
              size="sm"
              className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              Create new
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Name</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Prompt</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5 w-20">Version</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5 w-20">Tools</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Created</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Sparkles className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-[14px] text-gray-500">No agents yet</p>
                    <p className="text-[13px] text-gray-400 mt-1">Describe what you need above or click &quot;Create new&quot;</p>
                  </td>
                </tr>
              ) : (
                filtered.map((agent) => (
                  <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-[13px] font-medium text-gray-900">{agent.name}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500 max-w-[250px] truncate">{agent.prompt}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500">v{agent.version}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500">{agent.tools?.length || 0}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        agent.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                        agent.status === 'DRAFT' ? 'bg-gray-100 text-gray-500' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        {agent.status === 'ACTIVE' ? 'Active' : agent.status === 'DRAFT' ? 'Draft' : 'Paused'}
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
                          <DropdownMenuItem onClick={() => toggleAgent(agent.id, agent.status)} className="text-[13px]">
                            {agent.status === 'ACTIVE' ? (
                              <><Pause className="mr-2 h-4 w-4" /> Pause</>
                            ) : (
                              <><Play className="mr-2 h-4 w-4" /> Activate</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteAgent(agent.id)} className="text-[13px] text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

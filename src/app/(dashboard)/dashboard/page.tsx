'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Briefcase,
  MapPin,
  Upload,
  Link2,
  Sparkles,
  ArrowUp,
  Search,
  Plus,
  Star,
  MoreHorizontal,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore } from '@/hooks/use-workspace';

const sourceCards = [
  { name: 'Find people', icon: Users, href: '/dashboard/find-leads/people', color: 'text-red-500 bg-red-50' },
  { name: 'Find companies', icon: Building2, href: '/dashboard/find-leads/companies', color: 'text-violet-500 bg-violet-50' },
  { name: 'Find jobs', icon: Briefcase, href: '/dashboard/find-leads/jobs', color: 'text-amber-500 bg-amber-50' },
  { name: 'Local businesses', icon: MapPin, href: '/dashboard/find-leads/local-businesses', color: 'text-blue-500 bg-blue-50' },
  { name: 'Import CSV', icon: Upload, href: '#', color: 'text-green-500 bg-green-50' },
  { name: 'Import from CRM', icon: Link2, href: '#', color: 'text-purple-500 bg-purple-50' },
];

interface WorkspaceFile {
  id: string;
  name: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
  lastOpenedAt: string | null;
  createdById: string | null;
}

export default function DashboardPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState('all');
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFiles = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.data || []);
      }
    } catch {
      // silent
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleNewFile = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `New Table ${files.length + 1}` }),
      });
      if (res.ok) fetchFiles();
    } catch {
      // silent
    }
  };

  const filteredFiles = files.filter((f) => {
    if (activeTab === 'favorites') return f.isFavorite;
    if (searchQuery) return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-8">
      {/* AI Prompt */}
      <div className="text-center space-y-5">
        <h1 className="text-[22px] font-semibold text-gray-900 flex items-center justify-center gap-2">
          <span className="text-xl">🎨</span>
          What can we help you build today?
        </h1>

        <div className="max-w-[700px] mx-auto">
          <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3">
              <Sparkles className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Tell us how you'd like to get started or pick one of your personalized plays below..."
                className="border-0 shadow-none focus-visible:ring-0 px-0 text-[14px] placeholder:text-gray-400 h-auto py-0"
              />
              <button className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
                <ArrowUp className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Start from a source */}
      <div className="space-y-3">
        <p className="text-[13px] text-gray-500 font-medium">Start from a source</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {sourceCards.map((card) => (
            <Link
              key={card.name}
              href={card.href}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all flex-shrink-0 min-w-[160px]"
            >
              <div className={`p-1.5 rounded-md ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-medium text-gray-700">{card.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Files Section */}
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
            {['all', 'recents', 'favorites'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'all' ? 'All files' : tab === 'recents' ? 'Recents' : 'Favorites'}
              </button>
            ))}
          </div>
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-gray-900">
            {activeTab === 'all' ? 'All Files' : activeTab === 'recents' ? 'Recent Files' : 'Favorite Files'}
          </h2>
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
              onClick={handleNewFile}
              size="sm"
              className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Name</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5 w-20">Favorite</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Tags</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Created at</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <FileSpreadsheet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-[14px] text-gray-500">No files yet</p>
                    <p className="text-[13px] text-gray-400 mt-1">Create a new table to get started</p>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="h-4 w-4 text-gray-400" />
                        <span className="text-[13px] font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Star
                        className={`h-4 w-4 cursor-pointer ${
                          file.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-gray-400'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        {file.tags?.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500">{formatDate(file.createdAt)}</td>
                    <td className="px-4 py-2.5">
                      <button className="p-1 rounded hover:bg-gray-100">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
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

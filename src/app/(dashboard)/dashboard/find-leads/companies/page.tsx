'use client';

import { useState } from 'react';
import { Building2, Search, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore } from '@/hooks/use-workspace';

export default function FindCompaniesPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query && !industry) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/lead-finder/apollo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentWorkspace?.id ? { 'x-workspace-id': currentWorkspace.id } : {}),
        },
        body: JSON.stringify({
          organizationDomains: query ? [query] : [],
          organizationIndustries: industry ? [industry] : [],
          organizationSize: size || undefined,
        }),
      });
      const data = await res.json();
      setResults(data.success && data.data ? data.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-50">
          <Building2 className="h-5 w-5 text-violet-500" />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900">Find Companies</h1>
          <p className="text-[13px] text-gray-500">Search for companies by domain, industry, or size</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Company domain</label>
            <Input placeholder="e.g. stripe.com" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 text-[13px] border-gray-200" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Industry</label>
            <Input placeholder="e.g. SaaS, Finance" value={industry} onChange={(e) => setIndustry(e.target.value)} className="h-9 text-[13px] border-gray-200" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Company size</label>
            <Input placeholder="e.g. 50-200" value={size} onChange={(e) => setSize(e.target.value)} className="h-9 text-[13px] border-gray-200" />
          </div>
        </div>
        <Button onClick={handleSearch} disabled={loading || (!query && !industry)} size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search companies
        </Button>
      </div>

      {searched && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Company</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Domain</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Industry</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Size</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px] text-gray-500">{loading ? 'Searching...' : 'No results found.'}</td></tr>
              ) : (
                results.map((c: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-[13px] font-medium text-gray-900">{c.organization?.name || c.name || '—'}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{c.organization?.primaryDomain || c.domain || '—'}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{c.organization?.industry || c.industry || '—'}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{c.organization?.estimatedNumEmployees || c.size || '—'}</td>
                    <td className="px-4 py-2.5">
                      {(c.organization?.websiteUrl || c.website) && (
                        <a href={c.organization?.websiteUrl || c.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </td>
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

'use client';

import { useState } from 'react';
import { MapPin, Search, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore } from '@/hooks/use-workspace';

export default function FindLocalBusinessesPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/lead-finder/google-maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentWorkspace?.id ? { 'x-workspace-id': currentWorkspace.id } : {}),
        },
        body: JSON.stringify({ query: `${query} ${location}`.trim(), location }),
      });
      const data = await res.json();
      setResults(data.success && data.data ? data.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (biz: any) => {
    if (!currentWorkspace?.id) return;
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: biz.name,
          email: biz.email || undefined,
          phone: biz.phone || undefined,
          location: biz.address || biz.location,
          source: 'google_maps',
        }),
      });
    } catch {
      // silent
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50">
          <MapPin className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900">Find Local Businesses</h1>
          <p className="text-[13px] text-gray-500">Search for local businesses using Google Maps</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Business type</label>
            <Input placeholder="e.g. Restaurants, Dentists" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 text-[13px] border-gray-200" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Location</label>
            <Input placeholder="e.g. Austin, TX" value={location} onChange={(e) => setLocation(e.target.value)} className="h-9 text-[13px] border-gray-200" />
          </div>
        </div>
        <Button onClick={handleSearch} disabled={loading || !query} size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search businesses
        </Button>
      </div>

      {searched && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Business</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Address</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Phone</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Rating</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px] text-gray-500">{loading ? 'Searching...' : 'No businesses found.'}</td></tr>
              ) : (
                results.map((biz: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-[13px] font-medium text-gray-900">{biz.name || '—'}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{biz.address || biz.formattedAddress || '—'}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{biz.phone || biz.formattedPhoneNumber || '—'}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{biz.rating ? `${biz.rating} ★` : '—'}</td>
                    <td className="px-4 py-2.5">
                      <Button variant="ghost" size="sm" onClick={() => handleSave(biz)} className="h-7 text-[12px] text-gray-500 hover:text-blue-600">
                        <Save className="h-3.5 w-3.5 mr-1" /> Save
                      </Button>
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

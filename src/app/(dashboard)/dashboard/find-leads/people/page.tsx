'use client';

import { useState } from 'react';
import { Users, Search, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore } from '@/hooks/use-workspace';

interface PersonResult {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  location: string;
  linkedinUrl?: string;
}

export default function FindPeoplePage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [query, setQuery] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<PersonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query && !jobTitle) return;
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
          personTitles: jobTitle ? [jobTitle] : [],
          personLocations: location ? [location] : [],
          organizationDomains: query ? [query] : [],
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResults(data.data.map((p: any) => ({
          id: p.id || crypto.randomUUID(),
          name: [p.firstName, p.lastName].filter(Boolean).join(' ') || p.name || 'Unknown',
          email: p.email || '',
          title: p.title || p.jobTitle || '',
          company: p.organization?.name || p.company || '',
          location: p.location || p.city || '',
          linkedinUrl: p.linkedinUrl || '',
        })));
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (person: PersonResult) => {
    if (!currentWorkspace?.id) return;
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: person.name.split(' ')[0],
          lastName: person.name.split(' ').slice(1).join(' '),
          email: person.email,
          jobTitle: person.title,
          location: person.location,
          linkedinUrl: person.linkedinUrl,
          source: 'apollo',
        }),
      });
    } catch {
      // silent
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-50">
          <Users className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900">Find People</h1>
          <p className="text-[13px] text-gray-500">Search for people by company, job title, or location</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Company domain</label>
            <Input
              placeholder="e.g. google.com"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 text-[13px] border-gray-200"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Job title</label>
            <Input
              placeholder="e.g. VP Sales"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="h-9 text-[13px] border-gray-200"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Location</label>
            <Input
              placeholder="e.g. San Francisco"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 text-[13px] border-gray-200"
            />
          </div>
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || (!query && !jobTitle)}
          size="sm"
          className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search people
        </Button>
      </div>

      {searched && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Name</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Email</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Title</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Company</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-gray-500">
                    {loading ? 'Searching...' : 'No results found. Try different search criteria.'}
                  </td>
                </tr>
              ) : (
                results.map((person) => (
                  <tr key={person.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-[13px] font-medium text-gray-900">{person.name}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{person.email || '—'}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{person.title || '—'}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{person.company || '—'}</td>
                    <td className="px-4 py-2.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(person)}
                        className="h-7 text-[12px] text-gray-500 hover:text-blue-600"
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Save
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

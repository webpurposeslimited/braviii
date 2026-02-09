'use client';

import { useState } from 'react';
import { Briefcase, Search, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FindJobsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setSearched(true);
    // Job search would integrate with a jobs API
    setTimeout(() => {
      setResults([]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-50">
          <Briefcase className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900">Find Jobs</h1>
          <p className="text-[13px] text-gray-500">Search for job postings to identify companies that are hiring</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Job title or keyword</label>
            <Input placeholder="e.g. Sales Manager" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 text-[13px] border-gray-200" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Location</label>
            <Input placeholder="e.g. New York" value={location} onChange={(e) => setLocation(e.target.value)} className="h-9 text-[13px] border-gray-200" />
          </div>
        </div>
        <Button onClick={handleSearch} disabled={loading || !query} size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search jobs
        </Button>
      </div>

      {searched && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Title</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Company</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Location</th>
                <th className="text-left text-[12px] font-medium text-gray-500 px-4 py-2.5">Posted</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-gray-500">
                    {loading ? 'Searching...' : 'No job postings found. Try different keywords.'}
                  </td>
                </tr>
              ) : (
                results.map((job: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-[13px] font-medium text-gray-900">{job.title}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{job.company}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">{job.location}</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-500">{job.posted}</td>
                    <td className="px-4 py-2.5">
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noreferrer" className="text-blue-600">
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

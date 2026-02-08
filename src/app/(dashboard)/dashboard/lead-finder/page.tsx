'use client';

import { useState } from 'react';
import {
  Search, MapPin, Globe, Loader2, Plus, Download, Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkspaceStore } from '@/hooks/use-workspace';

interface FoundLead {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  location: string | null;
  source: string;
}

export default function LeadFinderPage() {
  const { currentWorkspace } = useWorkspaceStore();

  // Google Maps search
  const [mapsQuery, setMapsQuery] = useState('');
  const [mapsLocation, setMapsLocation] = useState('');
  const [mapsResults, setMapsResults] = useState<FoundLead[]>([]);
  const [isMapsSearching, setIsMapsSearching] = useState(false);

  // Apollo search
  const [apolloTitle, setApolloTitle] = useState('');
  const [apolloCompany, setApolloCompany] = useState('');
  const [apolloLocation, setApolloLocation] = useState('');
  const [apolloResults, setApolloResults] = useState<FoundLead[]>([]);
  const [isApolloSearching, setIsApolloSearching] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const handleMapsSearch = async () => {
    if (!mapsQuery.trim() || !currentWorkspace?.id) return;
    setIsMapsSearching(true);
    setMapsResults([]);
    try {
      const res = await fetch('/api/lead-finder/google-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': currentWorkspace.id },
        body: JSON.stringify({ query: mapsQuery, location: mapsLocation || undefined }),
      });
      if (res.ok) {
        const j = await res.json();
        const leads = (j.data?.leads || []).map((l: any) => ({
          name: l.companyName || 'Unknown',
          email: null,
          phone: l.companyPhone || null,
          company: l.companyName || null,
          title: null,
          location: l.companyAddress || null,
          source: 'google_maps',
        }));
        setMapsResults(leads);
      } else {
        const err = await res.json();
        alert(err.error || 'Google Maps search failed. Make sure the API key is configured in Admin Settings.');
      }
    } catch {
      alert('Network error');
    } finally { setIsMapsSearching(false); }
  };

  const handleApolloSearch = async () => {
    if ((!apolloTitle.trim() && !apolloCompany.trim()) || !currentWorkspace?.id) return;
    setIsApolloSearching(true);
    setApolloResults([]);
    try {
      const res = await fetch('/api/lead-finder/apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': currentWorkspace.id },
        body: JSON.stringify({
          title: apolloTitle || undefined,
          company: apolloCompany || undefined,
          location: apolloLocation || undefined,
        }),
      });
      if (res.ok) {
        const j = await res.json();
        setApolloResults(j.data || []);
      } else {
        const err = await res.json();
        alert(err.error || 'Apollo search failed. Make sure the API key is configured in Admin Settings.');
      }
    } catch {
      alert('Network error');
    } finally { setIsApolloSearching(false); }
  };

  const handleSaveToLeads = async (leads: FoundLead[]) => {
    if (!currentWorkspace?.id || leads.length === 0) return;
    setIsSaving(true);
    let saved = 0;
    for (const lead of leads) {
      if (!lead.email) continue;
      try {
        const res = await fetch(`/api/workspaces/${currentWorkspace.id}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: lead.email,
            firstName: lead.name?.split(' ')[0] || '',
            lastName: lead.name?.split(' ').slice(1).join(' ') || '',
            company: lead.company || undefined,
            title: lead.title || undefined,
            phone: lead.phone || undefined,
            location: lead.location || undefined,
            source: lead.source,
          }),
        });
        if (res.ok) saved++;
      } catch {}
    }
    setSavedCount(saved);
    setIsSaving(false);
    setTimeout(() => setSavedCount(0), 3000);
  };

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <Search className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-medium text-slate-900 mb-2">No workspace selected</h2>
        <p className="text-slate-500">Create or select a workspace in Settings to use Lead Finder.</p>
      </div>
    );
  }

  const renderResults = (results: FoundLead[], source: string) => (
    <div className="space-y-4">
      {results.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{results.length} results found</p>
          <div className="flex gap-2">
            {savedCount > 0 && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">{savedCount} saved</Badge>
            )}
            <Button size="sm" onClick={() => handleSaveToLeads(results)} disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Download className="h-3.5 w-3.5 mr-2" />}
              Save All to Leads
            </Button>
          </div>
        </div>
      )}
      {results.map((lead, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">{lead.name || 'Unknown'}</p>
              <p className="text-xs text-slate-500">
                {[lead.title, lead.company].filter(Boolean).join(' at ') || 'No details'}
              </p>
              <div className="flex gap-3 mt-1">
                {lead.email && <span className="text-xs text-blue-600">{lead.email}</span>}
                {lead.phone && <span className="text-xs text-slate-500">{lead.phone}</span>}
                {lead.location && <span className="text-xs text-slate-400">{lead.location}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{lead.source}</Badge>
            {lead.email && (
              <Button size="sm" variant="outline" onClick={() => handleSaveToLeads([lead])} disabled={isSaving}>
                <Plus className="h-3 w-3 mr-1" /> Save
              </Button>
            )}
          </div>
        </div>
      ))}
      {results.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No results yet. Run a search above.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Lead Finder</h1>
        <p className="text-slate-500 mt-1">Find new leads using Google Maps or Apollo</p>
      </div>

      <Tabs defaultValue="google-maps" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1">
          <TabsTrigger value="google-maps" className="gap-2">
            <MapPin className="h-4 w-4" /> Google Maps
          </TabsTrigger>
          <TabsTrigger value="apollo" className="gap-2">
            <Globe className="h-4 w-4" /> Apollo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="google-maps">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Google Maps Search</CardTitle>
              <CardDescription>Search for businesses on Google Maps and import as leads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Business Type / Query *</Label>
                  <Input value={mapsQuery} onChange={(e) => setMapsQuery(e.target.value)}
                    className="mt-1 border-slate-200" placeholder="e.g. dentists, restaurants, plumbers" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={mapsLocation} onChange={(e) => setMapsLocation(e.target.value)}
                    className="mt-1 border-slate-200" placeholder="e.g. New York, NY" />
                </div>
              </div>
              <Button onClick={handleMapsSearch} disabled={isMapsSearching || !mapsQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                {isMapsSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Search Google Maps
              </Button>
            </CardContent>
          </Card>
          <div className="mt-6">{renderResults(mapsResults, 'google_maps')}</div>
        </TabsContent>

        <TabsContent value="apollo">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Apollo People Search</CardTitle>
              <CardDescription>Find people and their contact info via Apollo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Job Title</Label>
                  <Input value={apolloTitle} onChange={(e) => setApolloTitle(e.target.value)}
                    className="mt-1 border-slate-200" placeholder="e.g. CEO, Marketing Manager" />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input value={apolloCompany} onChange={(e) => setApolloCompany(e.target.value)}
                    className="mt-1 border-slate-200" placeholder="e.g. Google, Stripe" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={apolloLocation} onChange={(e) => setApolloLocation(e.target.value)}
                    className="mt-1 border-slate-200" placeholder="e.g. San Francisco" />
                </div>
              </div>
              <Button onClick={handleApolloSearch} disabled={isApolloSearching || (!apolloTitle.trim() && !apolloCompany.trim())}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                {isApolloSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Search Apollo
              </Button>
            </CardContent>
          </Card>
          <div className="mt-6">{renderResults(apolloResults, 'apollo')}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

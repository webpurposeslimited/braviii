'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  Globe,
  MapPin,
  Loader2,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspaceStore } from '@/hooks/use-workspace';

interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
  linkedinUrl: string | null;
  location: string | null;
  description: string | null;
  createdAt: string;
  _count: { leads: number };
}

const emptyForm = {
  name: '',
  domain: '',
  industry: '',
  size: '',
  website: '',
  linkedinUrl: '',
  location: '',
  description: '',
};

export default function CompaniesPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCompanies = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/companies?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCompanies(json.data || []);
        setTotal(json.meta?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id, page, search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const openCreate = () => {
    setEditingCompany(null);
    setForm(emptyForm);
    setError('');
    setIsDialogOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setForm({
      name: company.name,
      domain: company.domain || '',
      industry: company.industry || '',
      size: company.size || '',
      website: company.website || '',
      linkedinUrl: company.linkedinUrl || '',
      location: company.location || '',
      description: company.description || '',
    });
    setError('');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentWorkspace?.id || !form.name.trim()) {
      setError('Company name is required');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const url = editingCompany
        ? `/api/workspaces/${currentWorkspace.id}/companies/${editingCompany.id}`
        : `/api/workspaces/${currentWorkspace.id}/companies`;
      const res = await fetch(url, {
        method: editingCompany ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok) {
        setIsDialogOpen(false);
        fetchCompanies();
      } else {
        setError(json.error?.message || 'Failed to save');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (company: Company) => {
    if (!currentWorkspace?.id) return;
    if (!confirm(`Delete "${company.name}"? This will unlink all associated leads.`)) return;
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/companies/${company.id}`, {
        method: 'DELETE',
      });
      fetchCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
          <p className="text-slate-500 mt-1">Manage companies associated with your leads</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        <Badge variant="outline" className="text-slate-600">
          {total} {total === 1 ? 'company' : 'companies'}
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : companies.length === 0 ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-slate-100 mb-4">
              <Building className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No companies yet</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm">
              {search ? 'No companies match your search.' : 'Add your first company to start organizing your leads by organization.'}
            </p>
            {!search && (
              <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="bg-white border-slate-200 hover:border-slate-300 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">{company.name}</h3>
                          {company.domain && (
                            <p className="text-sm text-slate-500 truncate">{company.domain}</p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-slate-200">
                          <DropdownMenuItem onClick={() => openEdit(company)} className="text-slate-700">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(company)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      {company.industry && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Badge variant="outline" className="text-xs font-normal">{company.industry}</Badge>
                        </div>
                      )}
                      {company.location && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{company.location}</span>
                        </div>
                      )}
                      {company.website && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-600">
                            {company.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{company._count.leads} {company._count.leads === 1 ? 'lead' : 'leads'}</span>
                      </div>
                      {company.size && (
                        <span className="text-xs text-slate-400">{company.size}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingCompany ? 'Edit Company' : 'Add Company'}
            </DialogTitle>
            <DialogDescription>
              {editingCompany ? 'Update company details.' : 'Add a new company to your workspace.'}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-700">Company Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Acme Corp"
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Domain</Label>
                <Input
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  placeholder="acme.com"
                  className="border-slate-200"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-700">Industry</Label>
                <Input
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  placeholder="Technology"
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Size</Label>
                <Input
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  placeholder="50-200"
                  className="border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="San Francisco, CA"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Website</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://acme.com"
                className="border-slate-200"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCompany ? 'Save Changes' : 'Add Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

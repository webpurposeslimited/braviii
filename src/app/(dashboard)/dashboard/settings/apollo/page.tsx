'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

export default function ApolloSettingsPage() {
  const { toast } = useToast();
  const [hasKey, setHasKey] = useState(false);
  const [credential, setCredential] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');
  const [label, setLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchCredential();
  }, []);

  const fetchCredential = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/apollo-credentials');
      if (res.ok) {
        const data = await res.json();
        setHasKey(data.data?.hasKey || false);
        setCredential(data.data?.credential || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/apollo-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, label: label || undefined }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Apollo API key saved successfully' });
        setApiKey('');
        setLabel('');
        fetchCredential();
      } else {
        const data = await res.json();
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to save',
          variant: 'destructive',
        });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove your Apollo API key? The system/tenant default will be used instead.')) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/apollo-credentials', { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Removed', description: 'Apollo API key removed' });
        fetchCredential();
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to remove', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Apollo Integration</h1>
        <p className="text-slate-500 mt-1">
          Link your personal Apollo API key. If not linked, the workspace or system default will be used.
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Current Status */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Current Status</CardTitle>
            <CardDescription>Your Apollo API key configuration</CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : hasKey ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Personal API Key Active</p>
                    <p className="text-sm text-slate-500">
                      {credential?.label || 'Your linked Apollo key'} · Added{' '}
                      {credential?.createdAt
                        ? new Date(credential.createdAt).toLocaleDateString()
                        : ''}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleRemove}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-50">
                  <AlertCircle className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">No Personal Key Linked</p>
                  <p className="text-sm text-slate-500">
                    Using workspace/system default Apollo credentials
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resolution Priority Info */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { step: '1', label: 'Your personal API key', desc: 'Used first if linked' },
                { step: '2', label: 'Workspace default', desc: 'Set by your workspace admin' },
                { step: '3', label: 'System default', desc: 'Set by the platform super admin' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Link Key Form */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">
              {hasKey ? 'Update' : 'Link'} Your Apollo API Key
            </CardTitle>
            <CardDescription>
              Your API key is encrypted and stored securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 bg-white border-slate-200"
                placeholder="Enter your Apollo API key"
              />
            </div>
            <div>
              <Label>Label (optional)</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 bg-white border-slate-200"
                placeholder="e.g. My Apollo Key"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={isLoading || !apiKey.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              {hasKey ? 'Update Key' : 'Link Key'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

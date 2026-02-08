'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Eye, EyeOff, Save, Loader2, CheckCircle,
  Mail, CreditCard, Brain, Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface SettingField {
  key: string;
  label: string;
  group: string;
  encrypted: boolean;
  placeholder?: string;
}

const settingFields: SettingField[] = [
  { key: 'stripe_secret_key', label: 'Stripe Secret Key', group: 'payment', encrypted: true, placeholder: 'sk_test_...' },
  { key: 'stripe_publishable_key', label: 'Stripe Publishable Key', group: 'payment', encrypted: false, placeholder: 'pk_test_...' },
  { key: 'smtp_host', label: 'SMTP Host', group: 'email', encrypted: false, placeholder: 'smtp.gmail.com' },
  { key: 'smtp_port', label: 'SMTP Port', group: 'email', encrypted: false, placeholder: '587' },
  { key: 'smtp_user', label: 'SMTP User', group: 'email', encrypted: false, placeholder: 'user@example.com' },
  { key: 'smtp_password', label: 'SMTP Password', group: 'email', encrypted: true },
  { key: 'google_client_id', label: 'Google OAuth Client ID', group: 'oauth', encrypted: false },
  { key: 'google_client_secret', label: 'Google OAuth Client Secret', group: 'oauth', encrypted: true },
  { key: 'microsoft_client_id', label: 'Microsoft OAuth Client ID', group: 'oauth', encrypted: false },
  { key: 'microsoft_client_secret', label: 'Microsoft OAuth Client Secret', group: 'oauth', encrypted: true },
  { key: 'apollo_api_key', label: 'Apollo API Key', group: 'integrations', encrypted: true },
  { key: 'google_maps_api_key', label: 'Google Maps API Key', group: 'integrations', encrypted: true },
  { key: 'openai_api_key', label: 'OpenAI API Key', group: 'ai', encrypted: true, placeholder: 'sk-...' },
  { key: 'openai_model', label: 'Default OpenAI Model', group: 'ai', encrypted: false, placeholder: 'gpt-4-turbo' },
];

const openAIModels = [
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Most capable model' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Optimized for speed and cost' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Smallest and fastest' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
];

export default function ApiSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [hasValue, setHasValue] = useState<Record<string, boolean>>({});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const j = await res.json();
        const vals: Record<string, string> = {};
        const has: Record<string, boolean> = {};
        (j.data || []).forEach((s: { key: string; value: string; hasValue: boolean }) => {
          vals[s.key] = s.value;
          has[s.key] = s.hasValue;
        });
        setValues(vals);
        setHasValue(has);
      }
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const toggleVisibility = (key: string) => {
    const next = new Set(visibleKeys);
    next.has(key) ? next.delete(key) : next.add(key);
    setVisibleKeys(next);
  };

  const handleSave = async (group: string) => {
    setIsSaving(true);
    setSaveMsg('');
    try {
      const fields = settingFields.filter(f => f.group === group);
      const settings = fields.map(f => ({
        key: f.key,
        value: values[f.key] || '',
        group: f.group,
        encrypted: f.encrypted,
      }));

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setSaveMsg('Settings saved successfully');
        fetchSettings();
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save');
      }
    } catch {} finally { setIsSaving(false); }
  };

  const renderField = (field: SettingField) => {
    const isVisible = visibleKeys.has(field.key);
    const val = values[field.key] || '';
    const isMasked = val === '••••••••••••';
    return (
      <div key={field.key} className="space-y-2">
        <Label className="text-slate-900 font-medium">{field.label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type={field.encrypted && !isVisible ? 'password' : 'text'}
            value={val}
            onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
            className="bg-white border-slate-200"
            placeholder={field.placeholder}
          />
          {field.encrypted && (
            <Button variant="outline" size="icon" onClick={() => toggleVisibility(field.key)}>
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </div>
        {hasValue[field.key] && isMasked && (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Configured</Badge>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">API Settings</h1>
        <p className="text-slate-500 mt-1">Manage all your API keys and integrations</p>
      </div>

      {saveMsg && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
          <CheckCircle className="h-4 w-4" /> {saveMsg}
        </div>
      )}

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 flex-wrap h-auto p-1">
          <TabsTrigger value="payment" className="gap-2"><CreditCard className="h-4 w-4" /> Payment</TabsTrigger>
          <TabsTrigger value="email" className="gap-2"><Mail className="h-4 w-4" /> Email</TabsTrigger>
          <TabsTrigger value="oauth" className="gap-2"><Globe className="h-4 w-4" /> OAuth</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2"><Globe className="h-4 w-4" /> Integrations</TabsTrigger>
          <TabsTrigger value="ai" className="gap-2"><Brain className="h-4 w-4" /> AI</TabsTrigger>
        </TabsList>

        {['payment', 'email', 'oauth', 'integrations', 'ai'].map((group) => (
          <TabsContent key={group} value={group}>
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900 capitalize">{group === 'ai' ? 'AI / OpenAI' : group} Configuration</CardTitle>
                <CardDescription>Manage {group} settings and API keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {settingFields.filter(f => f.group === group && f.key !== 'openai_model').map(renderField)}
                </div>

                {group === 'ai' && (
                  <div>
                    <Label className="text-slate-900 font-medium mb-3 block">Default Model</Label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {openAIModels.map((model) => {
                        const selected = (values.openai_model || 'gpt-4-turbo') === model.id;
                        return (
                          <div key={model.id}
                            onClick={() => setValues({ ...values, openai_model: model.id })}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{model.name}</p>
                                <p className="text-sm text-slate-500">{model.description}</p>
                              </div>
                              {selected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button onClick={() => handleSave(group)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save {group === 'ai' ? 'AI' : group.charAt(0).toUpperCase() + group.slice(1)} Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  Mail,
  CreditCard,
  Map,
  Brain,
  Globe,
  Users as UsersIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ApiKey {
  name: string;
  value: string;
  masked: string;
  status: 'active' | 'inactive';
}

const initialApiKeys: Record<string, ApiKey> = {
  stripe: {
    name: 'Stripe Secret Key',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  stripePublic: {
    name: 'Stripe Publishable Key',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  apollo: {
    name: 'Apollo API Key',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  googleMaps: {
    name: 'Google Maps API Key',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  googleClientId: {
    name: 'Google OAuth Client ID',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  googleClientSecret: {
    name: 'Google OAuth Client Secret',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  microsoftClientId: {
    name: 'Microsoft OAuth Client ID',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  microsoftClientSecret: {
    name: 'Microsoft OAuth Client Secret',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  smtpHost: {
    name: 'SMTP Host',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  smtpPort: {
    name: 'SMTP Port',
    value: '',
    masked: '587',
    status: 'inactive',
  },
  smtpUser: {
    name: 'SMTP User',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  smtpPassword: {
    name: 'SMTP Password',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
  openaiKey: {
    name: 'OpenAI API Key',
    value: '',
    masked: '••••••••••••••••',
    status: 'inactive',
  },
};

const openAIModels = [
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Most capable model, best for complex tasks' },
  { id: 'gpt-4', name: 'GPT-4', description: 'High intelligence model' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Optimized for speed and cost' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Smallest and fastest' },
];

export default function ApiSettingsPage() {
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');

  const toggleVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const updateApiKey = (keyId: string, value: string) => {
    setApiKeys({
      ...apiKeys,
      [keyId]: {
        ...apiKeys[keyId],
        value,
        status: value ? 'active' : 'inactive',
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  const testConnection = async (keyId: string) => {
    console.log('Testing connection for:', keyId);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-black">API Settings</h1>
        <p className="text-neutral-600 mt-1">Manage all your API keys and integrations in one place</p>
      </div>

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList className="bg-white border border-neutral-200">
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="oauth">
            <UsersIcon className="mr-2 h-4 w-4" />
            OAuth
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Globe className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="mr-2 h-4 w-4" />
            AI Models
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Stripe Configuration
                </CardTitle>
                <CardDescription>Configure Stripe for payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 rounded-lg bg-neutral-50">
                    <div className="flex-1">
                      <Label className="text-black font-medium">{apiKeys.stripe.name}</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type={visibleKeys.has('stripe') ? 'text' : 'password'}
                          value={visibleKeys.has('stripe') ? apiKeys.stripe.value : apiKeys.stripe.masked}
                          onChange={(e) => updateApiKey('stripe', e.target.value)}
                          className="bg-white border-neutral-200"
                          placeholder="sk_test_..."
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleVisibility('stripe')}
                          className="border-neutral-300"
                        >
                          {visibleKeys.has('stripe') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            apiKeys.stripe.status === 'active'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          }
                        >
                          {apiKeys.stripe.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between p-4 rounded-lg bg-neutral-50">
                    <div className="flex-1">
                      <Label className="text-black font-medium">{apiKeys.stripePublic.name}</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="text"
                          value={apiKeys.stripePublic.value}
                          onChange={(e) => updateApiKey('stripePublic', e.target.value)}
                          className="bg-white border-neutral-200"
                          placeholder="pk_test_..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="email">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  SMTP Configuration
                </CardTitle>
                <CardDescription>Configure SMTP for sending system emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-black">{apiKeys.smtpHost.name}</Label>
                    <Input
                      value={apiKeys.smtpHost.value}
                      onChange={(e) => updateApiKey('smtpHost', e.target.value)}
                      className="bg-white border-neutral-200 mt-2"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label className="text-black">{apiKeys.smtpPort.name}</Label>
                    <Input
                      value={apiKeys.smtpPort.value}
                      onChange={(e) => updateApiKey('smtpPort', e.target.value)}
                      className="bg-white border-neutral-200 mt-2"
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <Label className="text-black">{apiKeys.smtpUser.name}</Label>
                    <Input
                      value={apiKeys.smtpUser.value}
                      onChange={(e) => updateApiKey('smtpUser', e.target.value)}
                      className="bg-white border-neutral-200 mt-2"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label className="text-black">{apiKeys.smtpPassword.name}</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type={visibleKeys.has('smtpPassword') ? 'text' : 'password'}
                        value={visibleKeys.has('smtpPassword') ? apiKeys.smtpPassword.value : apiKeys.smtpPassword.masked}
                        onChange={(e) => updateApiKey('smtpPassword', e.target.value)}
                        className="bg-white border-neutral-200"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleVisibility('smtpPassword')}
                        className="border-neutral-300"
                      >
                        {visibleKeys.has('smtpPassword') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => testConnection('smtp')} className="border-neutral-300">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="oauth">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <CardTitle className="text-black">Google OAuth</CardTitle>
                <CardDescription>Configure Google OAuth for authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-black">{apiKeys.googleClientId.name}</Label>
                  <Input
                    value={apiKeys.googleClientId.value}
                    onChange={(e) => updateApiKey('googleClientId', e.target.value)}
                    className="bg-white border-neutral-200 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-black">{apiKeys.googleClientSecret.name}</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type={visibleKeys.has('googleClientSecret') ? 'text' : 'password'}
                      value={visibleKeys.has('googleClientSecret') ? apiKeys.googleClientSecret.value : apiKeys.googleClientSecret.masked}
                      onChange={(e) => updateApiKey('googleClientSecret', e.target.value)}
                      className="bg-white border-neutral-200"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleVisibility('googleClientSecret')}
                      className="border-neutral-300"
                    >
                      {visibleKeys.has('googleClientSecret') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <CardTitle className="text-black">Microsoft OAuth</CardTitle>
                <CardDescription>Configure Microsoft OAuth for authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-black">{apiKeys.microsoftClientId.name}</Label>
                  <Input
                    value={apiKeys.microsoftClientId.value}
                    onChange={(e) => updateApiKey('microsoftClientId', e.target.value)}
                    className="bg-white border-neutral-200 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-black">{apiKeys.microsoftClientSecret.name}</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type={visibleKeys.has('microsoftClientSecret') ? 'text' : 'password'}
                      value={visibleKeys.has('microsoftClientSecret') ? apiKeys.microsoftClientSecret.value : apiKeys.microsoftClientSecret.masked}
                      onChange={(e) => updateApiKey('microsoftClientSecret', e.target.value)}
                      className="bg-white border-neutral-200"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleVisibility('microsoftClientSecret')}
                      className="border-neutral-300"
                    >
                      {visibleKeys.has('microsoftClientSecret') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="integrations">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <CardTitle className="text-black">Apollo API</CardTitle>
                <CardDescription>Configure Apollo for lead sourcing and enrichment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-black">{apiKeys.apollo.name}</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type={visibleKeys.has('apollo') ? 'text' : 'password'}
                      value={visibleKeys.has('apollo') ? apiKeys.apollo.value : apiKeys.apollo.masked}
                      onChange={(e) => updateApiKey('apollo', e.target.value)}
                      className="bg-white border-neutral-200"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleVisibility('apollo')}
                      className="border-neutral-300"
                    >
                      {visibleKeys.has('apollo') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <Map className="h-5 w-5 text-blue-600" />
                  Google Maps API
                </CardTitle>
                <CardDescription>Configure Google Maps for location-based searches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-black">{apiKeys.googleMaps.name}</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type={visibleKeys.has('googleMaps') ? 'text' : 'password'}
                      value={visibleKeys.has('googleMaps') ? apiKeys.googleMaps.value : apiKeys.googleMaps.masked}
                      onChange={(e) => updateApiKey('googleMaps', e.target.value)}
                      className="bg-white border-neutral-200"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleVisibility('googleMaps')}
                      className="border-neutral-300"
                    >
                      {visibleKeys.has('googleMaps') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="ai">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  OpenAI Configuration
                </CardTitle>
                <CardDescription>Configure OpenAI for AI-powered features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-black">{apiKeys.openaiKey.name}</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type={visibleKeys.has('openaiKey') ? 'text' : 'password'}
                      value={visibleKeys.has('openaiKey') ? apiKeys.openaiKey.value : apiKeys.openaiKey.masked}
                      onChange={(e) => updateApiKey('openaiKey', e.target.value)}
                      className="bg-white border-neutral-200"
                      placeholder="sk-..."
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleVisibility('openaiKey')}
                      className="border-neutral-300"
                    >
                      {visibleKeys.has('openaiKey') ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-black mb-3 block">Default Model</Label>
                  <div className="grid gap-3">
                    {openAIModels.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedModel === model.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-black">{model.name}</p>
                            <p className="text-sm text-neutral-600">{model.description}</p>
                          </div>
                          {selectedModel === model.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

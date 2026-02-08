'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  Upload,
  Play,
  Building,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Users,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// TODO: Wire to real API
const enrichmentStats = {
  totalEnriched: 0,
  thisMonth: 0,
  successRate: 0,
  creditsUsed: 0,
};

const enrichmentFields = [
  { id: 'email', label: 'Work Email', icon: Mail, credits: 1, enabled: true },
  { id: 'phone', label: 'Direct Phone', icon: Phone, credits: 2, enabled: true },
  { id: 'linkedin', label: 'LinkedIn URL', icon: Linkedin, credits: 1, enabled: true },
  { id: 'company', label: 'Company Info', icon: Building, credits: 1, enabled: true },
  { id: 'website', label: 'Website', icon: Globe, credits: 0, enabled: true },
  { id: 'employees', label: 'Employee Count', icon: Users, credits: 1, enabled: false },
];

const recentEnrichments: any[] = [];

export default function EnrichmentPage() {
  const [singleSearch, setSingleSearch] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const [fields, setFields] = useState(enrichmentFields);

  const toggleField = (id: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const totalCredits = fields.filter(f => f.enabled).reduce((sum, f) => sum + f.credits, 0);

  const handleEnrich = async () => {
    setIsEnriching(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsEnriching(false);
    setSingleSearch('');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-blue-600" />
            Lead Enrichment
          </h1>
          <p className="text-slate-500 mt-1">Enrich your leads with verified contact data</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Enrich
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-slate-900">{enrichmentStats.totalEnriched.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Total Enriched</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{enrichmentStats.thisMonth.toLocaleString()}</p>
            <p className="text-sm text-slate-500">This Month</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{enrichmentStats.successRate}%</p>
            <p className="text-sm text-slate-500">Success Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{enrichmentStats.creditsUsed.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Credits Used</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="single">Single Enrichment</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Enrichment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Enrich a Lead</CardTitle>
                <CardDescription>Enter email or LinkedIn URL to enrich</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Enter email or LinkedIn URL..."
                      value={singleSearch}
                      onChange={(e) => setSingleSearch(e.target.value)}
                      className="pl-10 bg-white border-slate-200"
                    />
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleEnrich}
                    disabled={!singleSearch || isEnriching}
                  >
                    {isEnriching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Enrich
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-slate-400">
                  Estimated cost: {totalCredits} credits per lead
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Enrichment Fields</CardTitle>
                <CardDescription>Select which data to enrich</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.map((field) => {
                    const Icon = field.icon;
                    return (
                      <div key={field.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-slate-500" />
                          <Label className="text-slate-700">{field.label}</Label>
                          {field.credits > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {field.credits} credit{field.credits > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <Switch
                          checked={field.enabled}
                          onCheckedChange={() => toggleField(field.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Bulk Enrichment</CardTitle>
              <CardDescription>Enrich multiple leads at once</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                <Upload className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-700 mb-2">Upload a CSV file with leads to enrich</p>
                <p className="text-sm text-slate-400 mb-4">Required: Email or LinkedIn URL column</p>
                <Button variant="outline">Select File</Button>
              </div>
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Or enrich from your leads</h4>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="flex-1">
                    <Play className="mr-2 h-4 w-4" />
                    Enrich All Unenriched Leads
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Enrich Selected List
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Recent Enrichments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Lead</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Company</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Fields Found</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnrichments.map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4 text-sm text-slate-900">{item.lead}</td>
                        <td className="p-4 text-sm text-slate-700">{item.company}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(item.fieldsFound / item.totalFields) * 100}
                              className="h-2 w-20"
                            />
                            <span className="text-sm text-slate-500">
                              {item.fieldsFound}/{item.totalFields}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {item.status === 'complete' ? (
                            <Badge className="bg-emerald-50 text-emerald-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700">
                              Partial
                            </Badge>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

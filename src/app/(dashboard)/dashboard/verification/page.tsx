'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Play,
  Download,
  Search,
  Filter,
  Loader2,
  Mail,
  ShieldCheck,
  Zap,
  HelpCircle,
  RefreshCw,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const verificationStats = {
  total: 5000,
  valid: 4250,
  invalid: 450,
  risky: 200,
  catchAll: 100,
  creditsRemaining: 2450,
};

const recentVerifications = [
  { email: 'john.smith@techcorp.com', status: 'valid', reason: 'valid', provider: 'Google', leadId: 'lead_1', verifiedAt: '2 min ago' },
  { email: 'sarah.j@invalid-domain.xyz', status: 'invalid', reason: 'mx_missing', provider: null, leadId: null, verifiedAt: '5 min ago' },
  { email: 'mike@company.io', status: 'valid', reason: 'valid', provider: 'Microsoft', leadId: 'lead_2', verifiedAt: '8 min ago' },
  { email: 'catch@all-domain.com', status: 'catch_all', reason: 'catch_all_detected', provider: 'Custom', leadId: 'lead_3', verifiedAt: '12 min ago' },
  { email: 'risky@temp-mail.net', status: 'risky', reason: 'disposable', provider: null, leadId: null, verifiedAt: '15 min ago' },
  { email: 'emily.davis@startup.co', status: 'valid', reason: 'valid', provider: 'Google', leadId: 'lead_4', verifiedAt: '18 min ago' },
  { email: 'bounced@nowhere.com', status: 'invalid', reason: 'mailbox_unavailable', provider: null, leadId: null, verifiedAt: '22 min ago' },
  { email: 'contact@enterprise.com', status: 'valid', reason: 'valid', provider: 'Microsoft', leadId: 'lead_5', verifiedAt: '25 min ago' },
];

const statusConfig = {
  valid: { icon: CheckCircle, color: 'text-black', bg: 'bg-neutral-50', border: 'border-neutral-200', label: 'Valid' },
  invalid: { icon: XCircle, color: 'text-black', bg: 'bg-neutral-50', border: 'border-neutral-200', label: 'Invalid' },
  risky: { icon: AlertCircle, color: 'text-black', bg: 'bg-neutral-50', border: 'border-neutral-200', label: 'Risky' },
  catch_all: { icon: HelpCircle, color: 'text-black', bg: 'bg-neutral-50', border: 'border-neutral-200', label: 'Catch-All' },
  unknown: { icon: HelpCircle, color: 'text-neutral-500', bg: 'bg-neutral-50', border: 'border-neutral-200', label: 'Unknown' },
};

const reasonLabels: Record<string, string> = {
  valid: 'Verified mailbox exists',
  mx_missing: 'No MX records found',
  disposable: 'Disposable email domain',
  mailbox_unavailable: 'Mailbox does not exist',
  mailbox_full: 'Mailbox is full',
  catch_all_detected: 'Domain accepts all emails',
  role_account: 'Role-based email (e.g., info@)',
  rate_limited: 'Server rate limited',
  timeout: 'Verification timeout',
  blocked: 'Connection blocked',
  unknown_error: 'Unable to verify',
};

export default function VerificationPage() {
  const [singleEmail, setSingleEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const validRate = ((verificationStats.valid / verificationStats.total) * 100).toFixed(1);
  const invalidRate = ((verificationStats.invalid / verificationStats.total) * 100).toFixed(1);

  const handleSingleVerify = useCallback(async () => {
    if (!singleEmail) return;
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': 'current-workspace', // Would come from context
        },
        body: JSON.stringify({ email: singleEmail, source: 'manual' }),
      });
      
      const data = await response.json();
      if (data.success) {
        setVerificationResult(data.data);
      } else {
        setVerificationResult({ error: data.error });
      }
    } catch (error) {
      setVerificationResult({ error: 'Verification failed. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  }, [singleEmail]);

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">Email Verification</h1>
          <p className="text-neutral-500 mt-1">Verify emails to improve deliverability and reduce bounces</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neutral-200">
            <Zap className="h-4 w-4 text-black" />
            <span className="text-sm font-medium text-black">{verificationStats.creditsRemaining.toLocaleString()} credits</span>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="bg-white border-neutral-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-neutral-100">
                  <Mail className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-black">{verificationStats.total.toLocaleString()}</p>
                  <p className="text-sm text-neutral-500">Total Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="bg-white border-neutral-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-neutral-100">
                  <CheckCircle className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-black">{verificationStats.valid.toLocaleString()}</p>
                  <p className="text-sm text-neutral-500">Valid ({validRate}%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white border-neutral-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-neutral-100">
                  <XCircle className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-black">{verificationStats.invalid.toLocaleString()}</p>
                  <p className="text-sm text-neutral-500">Invalid ({invalidRate}%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-white border-neutral-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-neutral-100">
                  <AlertCircle className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-black">{verificationStats.risky.toLocaleString()}</p>
                  <p className="text-sm text-neutral-500">Risky</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white border-neutral-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-neutral-100">
                  <HelpCircle className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-black">{verificationStats.catchAll.toLocaleString()}</p>
                  <p className="text-sm text-neutral-500">Catch-All</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="single" className="space-y-4">
        <TabsList className="bg-white border border-neutral-200 p-1">
          <TabsTrigger value="single" className="data-[state=active]:bg-neutral-100 data-[state=active]:text-black">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Single Verification
          </TabsTrigger>
          <TabsTrigger value="bulk" className="data-[state=active]:bg-neutral-100 data-[state=active]:text-black">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Bulk Verification
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-neutral-100 data-[state=active]:text-black">
            <RefreshCw className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card className="bg-white border-neutral-200">
            <CardHeader>
              <CardTitle className="text-black">Verify Single Email</CardTitle>
              <CardDescription>Enter an email address to verify its deliverability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 max-w-2xl">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    type="email"
                    placeholder="Enter email address..."
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSingleVerify()}
                    className="pl-10 bg-white border-neutral-200 text-black placeholder:text-neutral-400"
                  />
                </div>
                <Button
                  onClick={handleSingleVerify}
                  disabled={!singleEmail || isVerifying}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Info className="h-4 w-4" />
                <span>Cost: 1 credit per verification</span>
              </div>

              {/* Verification Result */}
              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  {verificationResult.error ? (
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                      <p className="text-black">{verificationResult.error}</p>
                    </div>
                  ) : (
                    <div className={`p-5 rounded-lg border ${
                      statusConfig[verificationResult.status as keyof typeof statusConfig]?.bg || 'bg-slate-50'
                    } ${statusConfig[verificationResult.status as keyof typeof statusConfig]?.border || 'border-slate-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const config = statusConfig[verificationResult.status as keyof typeof statusConfig];
                              const Icon = config?.icon || HelpCircle;
                              return <Icon className={`h-6 w-6 ${config?.color || 'text-slate-500'}`} />;
                            })()}
                            <div>
                              <p className="font-medium text-black">{verificationResult.email}</p>
                              <p className={`text-sm ${statusConfig[verificationResult.status as keyof typeof statusConfig]?.color || 'text-slate-500'}`}>
                                {statusConfig[verificationResult.status as keyof typeof statusConfig]?.label || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-neutral-500">Reason</p>
                              <p className="font-medium text-black">{reasonLabels[verificationResult.reason] || verificationResult.reason}</p>
                            </div>
                            {verificationResult.provider && (
                              <div>
                                <p className="text-neutral-500">Provider</p>
                                <p className="font-medium text-black">{verificationResult.provider}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Bulk Email Verification</CardTitle>
              <CardDescription>Upload a CSV file to verify multiple emails at once</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 font-medium mb-2">Drag and drop a CSV file here</p>
                <p className="text-sm text-slate-500 mb-4">or click to browse files</p>
                <Button variant="outline" className="border-slate-200">Select File</Button>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                <span>Supported formats: CSV, TXT</span>
                <span>Max file size: 10MB (up to 10,000 emails)</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Verification History</CardTitle>
                  <CardDescription>View and export your verification results</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search emails..."
                      className="pl-10 w-64 bg-white border-slate-200"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="border-slate-200">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="border-slate-200">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Email</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Reason</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Provider</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVerifications.map((item, index) => {
                      const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.unknown;
                      const Icon = config.icon;
                      return (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900">{item.email}</span>
                              {item.leadId && (
                                <Badge variant="outline" className="text-xs border-slate-200 text-slate-500">
                                  Linked
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                              <Icon className="h-3.5 w-3.5" />
                              {config.label}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-slate-600">{reasonLabels[item.reason] || item.reason}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-slate-600">{item.provider || ''}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-slate-500">{item.verifiedAt}</span>
                          </td>
                        </motion.tr>
                      );
                    })}
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

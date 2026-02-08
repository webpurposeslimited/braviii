'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Loader2,
  Mail,
  ShieldCheck,
  HelpCircle,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkspaceStore } from '@/hooks/use-workspace';

const statusConfig: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  valid: { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'Valid' },
  invalid: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'Invalid' },
  risky: { icon: AlertCircle, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Risky' },
  catch_all: { icon: HelpCircle, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Catch-All' },
  unknown: { icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', label: 'Unknown' },
};

const reasonLabels: Record<string, string> = {
  valid: 'Verified mailbox exists',
  dns_verified: 'Verified via DNS (MX, SPF, DMARC)',
  mx_missing: 'No MX records found',
  syntax_invalid: 'Invalid email format',
  disposable: 'Disposable email domain',
  mailbox_unavailable: 'Mailbox does not exist',
  mailbox_full: 'Mailbox is full',
  catch_all_detected: 'Domain accepts all emails',
  role_account: 'Role-based email (e.g., info@)',
  rate_limited: 'Server rate limited',
  timeout: 'Verification timeout',
  no_smtp: 'SMTP not reachable',
  blocked: 'Connection blocked',
  unknown_error: 'Unable to verify',
};

export default function VerificationPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [singleEmail, setSingleEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleSingleVerify = useCallback(async () => {
    if (!singleEmail) return;

    if (!currentWorkspace?.id) {
      setVerificationResult({ error: 'Please select a workspace first.' });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': currentWorkspace.id,
        },
        body: JSON.stringify({ email: singleEmail, source: 'manual' }),
      });

      const data = await response.json();
      if (data.success) {
        setVerificationResult(data.data);
      } else {
        setVerificationResult({ error: data.error || 'Verification failed' });
      }
    } catch (error) {
      setVerificationResult({ error: 'Verification failed. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  }, [singleEmail, currentWorkspace]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Email Verification</h1>
        <p className="text-slate-500 mt-1">Verify emails to improve deliverability and reduce bounces</p>
      </div>

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1">
          <TabsTrigger value="single" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Single Verification
          </TabsTrigger>
          <TabsTrigger value="bulk" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Bulk Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Verify Single Email</CardTitle>
              <CardDescription>Enter an email address to verify its deliverability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 max-w-2xl">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="Enter email address..."
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSingleVerify()}
                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
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

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Info className="h-4 w-4" />
                <span>Cost: 1 credit per verification</span>
              </div>

              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  {verificationResult.error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{verificationResult.error}</p>
                    </div>
                  ) : (
                    <div className={`p-5 rounded-lg border ${
                      statusConfig[verificationResult.status]?.bg || 'bg-slate-50'
                    } ${statusConfig[verificationResult.status]?.border || 'border-slate-200'}`}>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const config = statusConfig[verificationResult.status] || statusConfig.unknown;
                            const Icon = config.icon;
                            return <Icon className={`h-6 w-6 ${config.color}`} />;
                          })()}
                          <div>
                            <p className="font-medium text-slate-900">{verificationResult.email}</p>
                            <p className={`text-sm ${statusConfig[verificationResult.status]?.color || 'text-slate-500'}`}>
                              {statusConfig[verificationResult.status]?.label || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Reason</p>
                            <p className="font-medium text-slate-900">{reasonLabels[verificationResult.reason] || verificationResult.reason}</p>
                          </div>
                          {verificationResult.provider && (
                            <div>
                              <p className="text-slate-500">Provider</p>
                              <p className="font-medium text-slate-900">{verificationResult.provider}</p>
                            </div>
                          )}
                          {verificationResult.dnsScore !== undefined && (
                            <div>
                              <p className="text-slate-500">DNS Score</p>
                              <p className="font-medium text-slate-900">{verificationResult.dnsScore}/100</p>
                            </div>
                          )}
                          {verificationResult.hasSPF !== undefined && (
                            <div>
                              <p className="text-slate-500">SPF Record</p>
                              <p className={`font-medium ${verificationResult.hasSPF ? 'text-green-700' : 'text-slate-400'}`}>
                                {verificationResult.hasSPF ? 'Found' : 'Not found'}
                              </p>
                            </div>
                          )}
                          {verificationResult.hasDMARC !== undefined && (
                            <div>
                              <p className="text-slate-500">DMARC Record</p>
                              <p className={`font-medium ${verificationResult.hasDMARC ? 'text-green-700' : 'text-slate-400'}`}>
                                {verificationResult.hasDMARC ? 'Found' : 'Not found'}
                              </p>
                            </div>
                          )}
                          {verificationResult.isDisposable && (
                            <div>
                              <p className="text-slate-500">Disposable</p>
                              <p className="font-medium text-red-700">Yes</p>
                            </div>
                          )}
                          {verificationResult.isRoleAccount && (
                            <div>
                              <p className="text-slate-500">Role Account</p>
                              <p className="font-medium text-amber-700">Yes</p>
                            </div>
                          )}
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
          <Card className="bg-white border-slate-200">
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
      </Tabs>
    </div>
  );
}

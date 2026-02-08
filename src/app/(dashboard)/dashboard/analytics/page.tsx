'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Mail, MousePointer, Reply, Users, Loader2, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWorkspaceStore } from '@/hooks/use-workspace';

interface Overview {
  totalLeads: number;
  newLeadsThisMonth: number;
  totalSequences: number;
  activeSequences: number;
  totalSent: number;
  openRate: number;
  replyRate: number;
  bounceRate: number;
  clickRate: number;
}
interface Campaign {
  id: string;
  name: string;
  status: string;
  totalLeads: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
}

export default function AnalyticsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/analytics`);
      if (res.ok) {
        const j = await res.json();
        setOverview(j.data?.overview || null);
        setCampaigns(j.data?.campaigns || []);
      }
    } catch {} finally { setIsLoading(false); }
  }, [currentWorkspace?.id]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <BarChart3 className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-medium text-slate-900 mb-2">No workspace selected</h2>
        <p className="text-slate-500">Create or select a workspace in Settings to view analytics.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const o = overview || { totalLeads: 0, newLeadsThisMonth: 0, totalSent: 0, openRate: 0, replyRate: 0, bounceRate: 0, clickRate: 0, totalSequences: 0, activeSequences: 0 };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Track your outreach performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Emails Sent', value: o.totalSent.toLocaleString(), icon: Mail, color: 'bg-blue-50', iconColor: 'text-blue-600' },
          { name: 'Open Rate', value: `${o.openRate}%`, icon: MousePointer, color: 'bg-purple-50', iconColor: 'text-purple-600' },
          { name: 'Reply Rate', value: `${o.replyRate}%`, icon: Reply, color: 'bg-orange-50', iconColor: 'text-orange-600' },
          { name: 'New Leads', value: o.newLeadsThisMonth.toLocaleString(), icon: Users, color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        ].map((stat) => (
          <Card key={stat.name} className="bg-white border-slate-200">
            <CardContent className="p-6">
              <div className={`p-2 rounded-xl ${stat.color} inline-block`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Total Leads</span><span className="font-medium text-slate-900">{o.totalLeads.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Total Sequences</span><span className="font-medium text-slate-900">{o.totalSequences}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Active Sequences</span><span className="font-medium text-slate-900">{o.activeSequences}</span></div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Deliverability Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: 'Open Rate', value: o.openRate },
              { label: 'Click Rate', value: o.clickRate },
              { label: 'Reply Rate', value: o.replyRate },
              { label: 'Bounce Rate', value: o.bounceRate },
            ].map((m) => (
              <div key={m.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{m.label}</span>
                  <span className="text-slate-900">{m.value}%</span>
                </div>
                <Progress value={m.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No campaigns yet. Create a sequence and launch a campaign to see data here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Campaign</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Sent</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Opened</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Clicked</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Replied</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Bounced</th>
                    <th className="p-4 text-right text-sm font-medium text-slate-500">Open Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 text-sm text-slate-900">{c.name}</td>
                      <td className="p-4 text-sm text-slate-700 text-right">{c.sent}</td>
                      <td className="p-4 text-sm text-slate-700 text-right">{c.opened}</td>
                      <td className="p-4 text-sm text-slate-700 text-right">{c.clicked}</td>
                      <td className="p-4 text-sm text-blue-600 text-right">{c.replied}</td>
                      <td className="p-4 text-sm text-red-500 text-right">{c.bounced}</td>
                      <td className="p-4 text-right">
                        <span className="text-sm text-slate-900">{c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : 0}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

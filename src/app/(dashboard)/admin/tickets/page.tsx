'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  UserPlus,
  Eye,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: MessageSquare },
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  WAITING_ON_USER: { label: 'Waiting on User', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
  CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterPriority]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterPriority !== 'all') params.set('priority', filterPriority);
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/admin/tickets?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    open: tickets.filter((t) => t.status === 'OPEN').length,
    pending: tickets.filter((t) => t.status === 'PENDING').length,
    waiting: tickets.filter((t) => t.status === 'WAITING_ON_USER').length,
    closed: tickets.filter((t) => t.status === 'CLOSED').length,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
        <p className="text-slate-500 mt-1">Manage all support tickets across tenants</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Open', value: stats.open, icon: MessageSquare, color: 'bg-blue-50', iconColor: 'text-blue-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-50', iconColor: 'text-amber-600' },
          { label: 'Waiting on User', value: stats.waiting, icon: AlertCircle, color: 'bg-orange-50', iconColor: 'text-orange-600' },
          { label: 'Closed', value: stats.closed, icon: CheckCircle, color: 'bg-slate-50', iconColor: 'text-slate-600' },
        ].map((stat, i) => (
          <Card key={i} className="bg-white border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-slate-900">All Tickets</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-10 w-64 bg-white border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-white border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="WAITING_ON_USER">Waiting on User</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40 bg-white border-slate-200">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No tickets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-3 text-left text-sm font-medium text-slate-500">Subject</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-500">User</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-500">Category</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-500">Priority</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-500">Status</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-500">Assigned</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-500">Created</th>
                    <th className="p-3 text-right text-sm font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, index) => {
                    const sc = statusConfig[ticket.status] || statusConfig.OPEN;
                    const pc = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;
                    return (
                      <motion.tr
                        key={ticket.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-3">
                          <p className="font-medium text-slate-900 max-w-[250px] truncate">{ticket.subject}</p>
                          <p className="text-xs text-slate-500">{ticket._count?.messages || 0} messages</p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-slate-700">{ticket.createdBy?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{ticket.createdBy?.email}</p>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-slate-700">{ticket.category}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={pc.color}>{pc.label}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={sc.color}>{sc.label}</Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-slate-600">
                            {ticket.assignedTo?.name || '—'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-slate-500">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link href={`/admin/tickets/${ticket.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

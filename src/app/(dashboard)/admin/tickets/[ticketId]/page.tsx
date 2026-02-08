'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  X,
  FileText,
  Image as ImageIcon,
  UserPlus,
  Lock,
  History,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  WAITING_ON_USER: { label: 'Waiting on User', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

export default function AdminTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('message', replyText);
      formData.append('isInternal', String(isInternal));
      for (const file of attachments) {
        formData.append('attachments', file);
      }

      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setReplyText('');
        setAttachments([]);
        setIsInternal(false);
        fetchTicket();
      } else {
        toast({ title: 'Error', description: 'Failed to send reply', variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateTicket = async (updates: Record<string, unknown>) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast({ title: 'Updated', description: 'Ticket updated successfully' });
        fetchTicket();
      } else {
        toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Ticket not found</p>
        <Link href="/admin/tickets">
          <Button variant="outline" className="mt-4">Go Back</Button>
        </Link>
      </div>
    );
  }

  const sc = statusConfig[ticket.status] || statusConfig.OPEN;
  const pc = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin/tickets')}
              className="mt-0.5"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">{ticket.subject}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className={sc.color}>{sc.label}</Badge>
                <Badge variant="outline" className={pc.color}>{pc.label}</Badge>
                <span className="text-sm text-slate-500">{ticket.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {ticket.messages?.map((msg: any, index: number) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex gap-3 ${msg.isInternal ? 'opacity-80' : ''}`}
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback
                  className={`text-xs font-medium ${
                    msg.senderType === 'ADMIN'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {getInitials(msg.sender?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900 text-sm">
                    {msg.sender?.name || 'User'}
                  </span>
                  {msg.senderType === 'ADMIN' && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs py-0">Staff</Badge>
                  )}
                  {msg.isInternal && (
                    <Badge className="bg-amber-100 text-amber-700 text-xs py-0">
                      <Lock className="h-3 w-3 mr-1" />
                      Internal Note
                    </Badge>
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <div
                  className={`border rounded-lg p-4 ${
                    msg.isInternal
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
                {msg.attachments?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.attachments.map((att: any) => (
                      <a
                        key={att.id}
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        {att.mimeType?.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-slate-500" />
                        )}
                        <span className="max-w-[150px] truncate">{att.fileName}</span>
                        <span className="text-xs text-slate-400">{formatFileSize(att.size)}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        <div className="p-4 border-t border-slate-200 bg-white">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                >
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="max-w-[120px] truncate text-slate-700">{file.name}</span>
                  <button onClick={() => removeAttachment(i)}>
                    <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setIsInternal(false)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                !isInternal ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 inline mr-1" />
              Reply
            </button>
            <button
              onClick={() => setIsInternal(true)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                isInternal ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Lock className="h-3.5 w-3.5 inline mr-1" />
              Internal Note
            </button>
          </div>
          <div className="flex gap-3">
            <Textarea
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
              placeholder={isInternal ? 'Add an internal note (not visible to user)...' : 'Type your reply...'}
              className={`flex-1 min-h-[80px] resize-none ${
                isInternal ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendReply();
              }}
            />
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.zip"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="border-slate-200"
              >
                <Paperclip className="h-4 w-4 text-slate-500" />
              </Button>
              <Button
                onClick={handleSendReply}
                disabled={isSending || !replyText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Ctrl+Enter to send</p>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-80 border-l border-slate-200 bg-white p-5 space-y-6 overflow-y-auto hidden lg:block">
        {/* Ticket Info */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Ticket Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Created by</span>
              <span className="font-medium text-slate-900">{ticket.createdBy?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="text-slate-700">{ticket.createdBy?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Created</span>
              <span className="text-slate-700">{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Status */}
        <div>
          <Label className="text-sm font-semibold text-slate-900">Status</Label>
          <Select
            value={ticket.status}
            onValueChange={(v) => handleUpdateTicket({ status: v })}
            disabled={isUpdating}
          >
            <SelectTrigger className="mt-2 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="WAITING_ON_USER">Waiting on User</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div>
          <Label className="text-sm font-semibold text-slate-900">Priority</Label>
          <Select
            value={ticket.priority}
            onValueChange={(v) => handleUpdateTicket({ priority: v })}
            disabled={isUpdating}
          >
            <SelectTrigger className="mt-2 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assigned To */}
        <div>
          <Label className="text-sm font-semibold text-slate-900">Assigned To</Label>
          <div className="mt-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
            {ticket.assignedTo ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {getInitials(ticket.assignedTo.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-900">{ticket.assignedTo.name}</p>
                  <p className="text-xs text-slate-500">{ticket.assignedTo.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Unassigned</p>
            )}
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Audit Log */}
        {ticket.statusHistory?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Status History
            </h3>
            <div className="space-y-2">
              {ticket.statusHistory.map((entry: any) => (
                <div key={entry.id} className="text-xs p-2 rounded bg-slate-50 border border-slate-100">
                  <p className="text-slate-700">
                    <span className="font-medium">{statusConfig[entry.oldStatus]?.label}</span>
                    {' → '}
                    <span className="font-medium">{statusConfig[entry.newStatus]?.label}</span>
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    {new Date(entry.createdAt).toLocaleString()} · {entry.changedByType}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

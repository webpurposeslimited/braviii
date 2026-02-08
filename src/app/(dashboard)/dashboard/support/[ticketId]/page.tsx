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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  WAITING_ON_USER: { label: 'Waiting on You', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

interface TicketMessage {
  id: string;
  senderType: 'USER' | 'ADMIN';
  message: string;
  isInternal: boolean;
  createdAt: string;
  sender: { id: string; name: string | null; avatar: string | null };
  attachments: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
    mimeType: string;
    size: number;
  }>;
}

interface TicketDetail {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  createdBy: { id: string; name: string | null; email: string; avatar: string | null };
  assignedTo: { id: string; name: string | null } | null;
  messages: TicketMessage[];
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as string;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
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
        fetchTicket();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
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
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
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
        <Link href="/dashboard/support">
          <Button variant="outline" className="mt-4">Go Back</Button>
        </Link>
      </div>
    );
  }

  const sc = statusConfig[ticket.status] || statusConfig.OPEN;
  const pc = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/support')}
              className="mt-0.5"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{ticket.subject}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className={sc.color}>{sc.label}</Badge>
                <Badge variant="outline" className={pc.color}>{pc.label}</Badge>
                <span className="text-sm text-slate-500">{ticket.category}</span>
                <span className="text-sm text-slate-500">
                  Created {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          {ticket.assignedTo && (
            <div className="text-right">
              <p className="text-xs text-slate-500">Assigned to</p>
              <p className="text-sm font-medium text-slate-700">{ticket.assignedTo.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {ticket.messages
          .filter((m) => !m.isInternal)
          .map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex gap-3 ${msg.senderType === 'USER' ? '' : ''}`}
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback
                  className={`text-xs font-medium ${
                    msg.senderType === 'ADMIN'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {getInitials(msg.sender.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900 text-sm">
                    {msg.sender.name || 'User'}
                  </span>
                  {msg.senderType === 'ADMIN' && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs py-0">Staff</Badge>
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
                {msg.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {att.mimeType.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-slate-500" />
                        )}
                        <span className="max-w-[150px] truncate">{att.fileName}</span>
                        <span className="text-xs text-slate-400">
                          {formatFileSize(att.size)}
                        </span>
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
      {ticket.status !== 'CLOSED' && (
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
          <div className="flex gap-3">
            <Textarea
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 bg-white border-slate-200 min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSendReply();
                }
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
      )}
    </div>
  );
}

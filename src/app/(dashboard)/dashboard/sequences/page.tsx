'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  Mail,
  Clock,
  Users,
  TrendingUp,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockSequences = [
  {
    id: '1',
    name: 'Q4 Enterprise Outreach',
    description: 'Multi-touch sequence for enterprise decision makers',
    status: 'active',
    steps: 5,
    enrolled: 450,
    completed: 312,
    replied: 45,
    openRate: 68,
    replyRate: 10,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Product Launch Campaign',
    description: 'Introducing new features to existing customers',
    status: 'active',
    steps: 4,
    enrolled: 1200,
    completed: 890,
    replied: 89,
    openRate: 72,
    replyRate: 7.4,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Follow-up Sequence',
    description: 'Re-engage leads who went cold',
    status: 'paused',
    steps: 3,
    enrolled: 320,
    completed: 180,
    replied: 28,
    openRate: 54,
    replyRate: 8.7,
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    name: 'Webinar Invitation',
    description: 'Invite prospects to upcoming webinar',
    status: 'draft',
    steps: 2,
    enrolled: 0,
    completed: 0,
    replied: 0,
    openRate: 0,
    replyRate: 0,
    createdAt: '2024-01-20',
  },
];

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  paused: { label: 'Paused', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  draft: { label: 'Draft', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  completed: { label: 'Completed', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export default function SequencesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sequences</h1>
          <p className="text-white/60 mt-1">Create and manage email sequences</p>
        </div>
        <Button variant="cyan">
          <Plus className="mr-2 h-4 w-4" />
          New Sequence
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card glass>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">4</p>
                <p className="text-sm text-white/60">Total Sequences</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <Play className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">2</p>
                <p className="text-sm text-white/60">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">1,970</p>
                <p className="text-sm text-white/60">Total Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">8.2%</p>
                <p className="text-sm text-white/60">Avg Reply Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search sequences..."
            className="pl-10 bg-white/5 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mockSequences.map((sequence, index) => (
          <motion.div
            key={sequence.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card glass className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-white flex items-center gap-2">
                      {sequence.name}
                      <Badge
                        variant="outline"
                        className={statusConfig[sequence.status as keyof typeof statusConfig].color}
                      >
                        {statusConfig[sequence.status as keyof typeof statusConfig].label}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-white/60">{sequence.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      {sequence.status === 'active' ? (
                        <DropdownMenuItem>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem>
                          <Play className="mr-2 h-4 w-4" />
                          Start
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-400">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {sequence.steps} steps
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {sequence.enrolled} enrolled
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {sequence.createdAt}
                  </div>
                </div>

                {sequence.enrolled > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Progress</span>
                      <span className="text-white">
                        {sequence.completed} / {sequence.enrolled} completed
                      </span>
                    </div>
                    <Progress
                      value={(sequence.completed / sequence.enrolled) * 100}
                      className="h-2"
                    />
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Open Rate: </span>
                        <span className="text-white">{sequence.openRate}%</span>
                      </div>
                      <div>
                        <span className="text-white/60">Reply Rate: </span>
                        <span className="text-white">{sequence.replyRate}%</span>
                      </div>
                      <div>
                        <span className="text-white/60">Replies: </span>
                        <span className="text-white">{sequence.replied}</span>
                      </div>
                    </div>
                  </div>
                )}

                {sequence.status === 'draft' && (
                  <div className="flex gap-2 mt-4">
                    <Button variant="glass" size="sm" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Sequence
                    </Button>
                    <Button variant="cyan" size="sm" className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Launch
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

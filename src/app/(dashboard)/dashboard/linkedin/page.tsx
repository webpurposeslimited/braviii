'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Linkedin,
  CheckCircle,
  Clock,
  UserPlus,
  MessageSquare,
  Eye,
  Filter,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const taskStats = [
  { label: 'Pending', value: 12, icon: Clock, color: 'text-amber-400' },
  { label: 'Completed Today', value: 8, icon: CheckCircle, color: 'text-emerald-400' },
  { label: 'Connection Requests', value: 5, icon: UserPlus, color: 'text-blue-400' },
  { label: 'Messages to Send', value: 7, icon: MessageSquare, color: 'text-purple-400' },
];

const pendingTasks = [
  {
    id: '1',
    type: 'connection',
    lead: { name: 'Sarah Johnson', title: 'VP of Sales', company: 'TechCorp', avatar: '' },
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    sequence: 'Q4 Enterprise Outreach',
    dueDate: 'Today',
    priority: 'high',
  },
  {
    id: '2',
    type: 'message',
    lead: { name: 'Michael Chen', title: 'CTO', company: 'StartupXYZ', avatar: '' },
    linkedinUrl: 'https://linkedin.com/in/michaelchen',
    sequence: 'Product Launch',
    message: 'Hi Michael, I noticed your recent post about...',
    dueDate: 'Today',
    priority: 'high',
  },
  {
    id: '3',
    type: 'view',
    lead: { name: 'Emily Davis', title: 'Head of Marketing', company: 'GrowthCo', avatar: '' },
    linkedinUrl: 'https://linkedin.com/in/emilydavis',
    sequence: 'Warm Leads Follow-up',
    dueDate: 'Tomorrow',
    priority: 'medium',
  },
  {
    id: '4',
    type: 'connection',
    lead: { name: 'James Wilson', title: 'Director of Operations', company: 'Enterprise Inc', avatar: '' },
    linkedinUrl: 'https://linkedin.com/in/jameswilson',
    sequence: 'Q4 Enterprise Outreach',
    dueDate: 'Tomorrow',
    priority: 'medium',
  },
];

const taskTypeConfig = {
  connection: { icon: UserPlus, label: 'Send Connection', color: 'bg-blue-500/20 text-blue-400' },
  message: { icon: MessageSquare, label: 'Send Message', color: 'bg-purple-500/20 text-purple-400' },
  view: { icon: Eye, label: 'View Profile', color: 'bg-emerald-500/20 text-emerald-400' },
};

export default function LinkedInTasksPage() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const handleComplete = (taskId: string) => {
    setCompletedTasks([...completedTasks, taskId]);
  };

  const activeTasks = pendingTasks.filter(t => !completedTasks.includes(t.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Linkedin className="h-8 w-8 text-[#0A66C2]" />
            LinkedIn Tasks
          </h1>
          <p className="text-white/60 mt-1">Manual LinkedIn actions for your sequences</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {taskStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card glass>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white/5">
            <TabsTrigger value="pending">Pending ({activeTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input placeholder="Search tasks..." className="pl-10 w-64 bg-white/5 border-white/10" />
            </div>
            <Button variant="ghost" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="pending" className="space-y-4">
          {activeTasks.map((task, index) => {
            const config = taskTypeConfig[task.type as keyof typeof taskTypeConfig];
            const Icon = config.icon;
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card glass>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={task.lead.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent-cyan text-white">
                            {task.lead.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{task.lead.name}</h3>
                            <a
                              href={task.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0A66C2] hover:text-[#0A66C2]/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          <p className="text-sm text-white/60">
                            {task.lead.title} at {task.lead.company}
                          </p>
                          <p className="text-xs text-white/40 mt-1">Sequence: {task.sequence}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <p className={`text-sm mt-1 ${task.priority === 'high' ? 'text-amber-400' : 'text-white/60'}`}>
                            {task.dueDate}
                          </p>
                        </div>
                        <Button
                          variant="cyan"
                          size="sm"
                          onClick={() => handleComplete(task.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Done
                        </Button>
                      </div>
                    </div>
                    {task.type === 'message' && 'message' in task && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-sm text-white/80">{task.message}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {activeTasks.length === 0 && (
            <Card glass>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
                <p className="text-white/60">No pending LinkedIn tasks</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <Card glass>
            <CardContent className="p-6">
              {completedTasks.length > 0 ? (
                <div className="space-y-3">
                  {pendingTasks
                    .filter(t => completedTasks.includes(t.id))
                    .map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                          <span className="text-white">{task.lead.name}</span>
                          <Badge variant="outline" className="text-white/60">
                            {taskTypeConfig[task.type as keyof typeof taskTypeConfig].label}
                          </Badge>
                        </div>
                        <span className="text-sm text-white/40">Just now</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-white/60">No completed tasks yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

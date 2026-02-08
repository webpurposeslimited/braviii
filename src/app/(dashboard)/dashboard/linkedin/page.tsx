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
  { label: 'Pending', value: 0, icon: Clock, color: 'text-amber-600' },
  { label: 'Completed Today', value: 0, icon: CheckCircle, color: 'text-emerald-600' },
  { label: 'Connection Requests', value: 0, icon: UserPlus, color: 'text-blue-600' },
  { label: 'Messages to Send', value: 0, icon: MessageSquare, color: 'text-purple-600' },
];

const pendingTasks: any[] = [];

const taskTypeConfig = {
  connection: { icon: UserPlus, label: 'Send Connection', color: 'bg-blue-50 text-blue-700' },
  message: { icon: MessageSquare, label: 'Send Message', color: 'bg-purple-50 text-purple-700' },
  view: { icon: Eye, label: 'View Profile', color: 'bg-slate-100 text-slate-700' },
};

export default function LinkedInTasksPage() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const handleComplete = (taskId: string) => {
    setCompletedTasks([...completedTasks, taskId]);
  };

  const activeTasks = pendingTasks.filter(t => !completedTasks.includes(t.id));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
            <Linkedin className="h-7 w-7 text-[#0A66C2]" />
            LinkedIn Tasks
          </h1>
          <p className="text-slate-500 mt-1">Manual LinkedIn actions for your sequences</p>
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
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="pending">Pending ({activeTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search tasks..." className="pl-10 w-64 bg-white border-slate-200" />
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
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={task.lead.avatar} />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {task.lead.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900">{task.lead.name}</h3>
                            <a
                              href={task.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0A66C2] hover:text-[#0A66C2]/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          <p className="text-sm text-slate-500">
                            {task.lead.title} at {task.lead.company}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Sequence: {task.sequence}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <p className={`text-sm mt-1 ${task.priority === 'high' ? 'text-amber-600' : 'text-slate-500'}`}>
                            {task.dueDate}
                          </p>
                        </div>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                          onClick={() => handleComplete(task.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Done
                        </Button>
                      </div>
                    </div>
                    {task.type === 'message' && 'message' in task && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700">{task.message}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {activeTasks.length === 0 && (
            <Card className="bg-white border-slate-200">
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
                <p className="text-slate-500">No pending LinkedIn tasks</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              {completedTasks.length > 0 ? (
                <div className="space-y-3">
                  {pendingTasks
                    .filter(t => completedTasks.includes(t.id))
                    .map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                          <span className="text-slate-900">{task.lead.name}</span>
                          <Badge variant="outline" className="text-slate-500">
                            {taskTypeConfig[task.type as keyof typeof taskTypeConfig].label}
                          </Badge>
                        </div>
                        <span className="text-sm text-slate-400">Just now</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-slate-500">No completed tasks yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Upload,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockLeads = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    jobTitle: 'VP of Sales',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    emailStatus: 'valid',
    status: 'new',
    tags: ['enterprise', 'hot-lead'],
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@innovate.io',
    phone: '+1 (555) 234-5678',
    jobTitle: 'Marketing Director',
    company: 'Innovate.io',
    location: 'New York, NY',
    emailStatus: 'valid',
    status: 'contacted',
    tags: ['mid-market'],
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'mchen@globaltech.com',
    phone: '+1 (555) 345-6789',
    jobTitle: 'CTO',
    company: 'GlobalTech',
    location: 'Austin, TX',
    emailStatus: 'risky',
    status: 'engaged',
    tags: ['enterprise', 'decision-maker'],
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@startup.co',
    phone: '+1 (555) 456-7890',
    jobTitle: 'Head of Growth',
    company: 'StartupCo',
    location: 'Seattle, WA',
    emailStatus: 'valid',
    status: 'qualified',
    tags: ['startup', 'hot-lead'],
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'dwilson@enterprise.net',
    phone: '+1 (555) 567-8901',
    jobTitle: 'Sales Manager',
    company: 'Enterprise Net',
    location: 'Chicago, IL',
    emailStatus: 'invalid',
    status: 'new',
    tags: ['enterprise'],
  },
];

const statusColors = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  engaged: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  qualified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  converted: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  unqualified: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const emailStatusIcons = {
  valid: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  invalid: <XCircle className="h-4 w-4 text-red-400" />,
  risky: <AlertCircle className="h-4 w-4 text-amber-400" />,
  pending: <AlertCircle className="h-4 w-4 text-white/40" />,
};

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleAllLeads = () => {
    if (selectedLeads.length === mockLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(mockLeads.map((lead) => lead.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-white/60 mt-1">Manage and organize your leads</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="glass">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="cyan">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white/5">
            <TabsTrigger value="all">All Leads</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="contacted">Contacted</TabsTrigger>
            <TabsTrigger value="qualified">Qualified</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search leads..."
                className="pl-10 w-64 bg-white/5 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-white/5 border-white/10">
                <SelectValue placeholder="Filter by list" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lists</SelectItem>
                <SelectItem value="hot">Hot Leads</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="startup">Startups</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {selectedLeads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
            >
              <span className="text-sm text-white">
                {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button variant="ghost" size="sm">Add to List</Button>
                <Button variant="ghost" size="sm">Add to Sequence</Button>
                <Button variant="ghost" size="sm">Verify Emails</Button>
                <Button variant="ghost" size="sm" className="text-red-400">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </motion.div>
          )}

          <Card glass>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          className="rounded border-white/20 bg-white/5"
                          checked={selectedLeads.length === mockLeads.length}
                          onChange={toggleAllLeads}
                        />
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-white/60">Name</th>
                      <th className="p-4 text-left text-sm font-medium text-white/60">Contact</th>
                      <th className="p-4 text-left text-sm font-medium text-white/60">Company</th>
                      <th className="p-4 text-left text-sm font-medium text-white/60">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-white/60">Tags</th>
                      <th className="p-4 text-right text-sm font-medium text-white/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockLeads.map((lead) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="rounded border-white/20 bg-white/5"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-accent-cyan text-white">
                                {lead.firstName[0]}{lead.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-white">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <p className="text-sm text-white/60">{lead.jobTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              {emailStatusIcons[lead.emailStatus as keyof typeof emailStatusIcons]}
                              <span className="text-white/80">{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-white/80">
                              <Building className="h-3 w-3" />
                              {lead.company}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <MapPin className="h-3 w-3" />
                              {lead.location}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={statusColors[lead.status as keyof typeof statusColors]}
                          >
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {lead.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Add to Sequence
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-400">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

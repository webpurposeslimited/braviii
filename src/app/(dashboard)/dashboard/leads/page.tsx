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

// TODO: Wire to real API endpoint (e.g. /api/workspaces/[id]/leads)
const mockLeads: any[] = [];

const statusColors = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-purple-50 text-purple-700 border-purple-200',
  engaged: 'bg-amber-50 text-amber-700 border-amber-200',
  qualified: 'bg-blue-50 text-blue-700 border-blue-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  unqualified: 'bg-red-50 text-red-700 border-red-200',
};

const emailStatusIcons = {
  valid: <CheckCircle className="h-4 w-4 text-emerald-600" />,
  invalid: <XCircle className="h-4 w-4 text-red-500" />,
  risky: <AlertCircle className="h-4 w-4 text-amber-500" />,
  pending: <AlertCircle className="h-4 w-4 text-slate-400" />,
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
          <p className="text-slate-500 mt-1">Manage and organize your leads</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="all">All Leads</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="contacted">Contacted</TabsTrigger>
            <TabsTrigger value="qualified">Qualified</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search leads..."
                className="pl-10 w-64 bg-white border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-white border-slate-200">
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
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200"
            >
              <span className="text-sm text-slate-700">
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

          <Card className="bg-white border-slate-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={selectedLeads.length === mockLeads.length}
                          onChange={toggleAllLeads}
                        />
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Name</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Contact</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Company</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Tags</th>
                      <th className="p-4 text-right text-sm font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockLeads.map((lead) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-600 text-white">
                                {lead.firstName[0]}{lead.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <p className="text-sm text-slate-500">{lead.jobTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              {emailStatusIcons[lead.emailStatus as keyof typeof emailStatusIcons]}
                              <span className="text-slate-700">{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Building className="h-3 w-3" />
                              {lead.company}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
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

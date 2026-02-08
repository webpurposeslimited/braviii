'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Shield,
  ShieldCheck,
  Search,
  Edit,
  Trash2,
  UserCog,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
  adminRoles: Array<{
    adminRole: {
      id: string;
      name: string;
      permissions: Array<{ permission: { code: string; name: string } }>;
    };
  }>;
}

interface AdminRole {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  _count: { users: number };
  permissions: Array<{ permission: { code: string; name: string; group: string } }>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminRoleIds: [] as string[],
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data.data?.roles || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({ name: '', email: '', password: '', adminRoleIds: [] });
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '',
      adminRoleIds: user.adminRoles.map((r) => r.adminRole.id),
    });
    setIsEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          adminRoleIds: formData.adminRoleIds,
        }),
      });
      if (res.ok) {
        setIsEditOpen(false);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Remove admin access for this user?')) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRole = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      adminRoleIds: prev.adminRoleIds.includes(roleId)
        ? prev.adminRoleIds.filter((id) => id !== roleId)
        : [...prev.adminRoleIds, roleId],
    }));
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
          <p className="text-slate-500 mt-1">Manage admin accounts, roles, and permissions</p>
        </div>
        <Button
          onClick={() => {
            setFormData({ name: '', email: '', password: '', adminRoleIds: [] });
            setIsCreateOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Admin User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">
                  {users.filter((u) => u.isSuperAdmin).length}
                </p>
                <p className="text-sm text-slate-500">Super Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{users.length}</p>
                <p className="text-sm text-slate-500">Total Admin Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50">
                <UserCog className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{roles.length}</p>
                <p className="text-sm text-slate-500">Roles Defined</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900">All Admin Users</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                className="pl-10 w-64 bg-white border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users
              .filter(
                (u) =>
                  !searchQuery ||
                  u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{user.name || 'Unnamed'}</p>
                        {user.isSuperAdmin && (
                          <Badge className="bg-blue-600 text-white text-xs">Super Admin</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {user.adminRoles.map((r) => (
                        <Badge key={r.adminRole.id} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                          {r.adminRole.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                      {!user.isSuperAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Add Admin User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 bg-white border-slate-200"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 bg-white border-slate-200"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 bg-white border-slate-200"
              />
            </div>
            <div>
              <Label className="mb-2 block">Roles</Label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.adminRoleIds.includes(role.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.adminRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{role.name}</p>
                      <p className="text-xs text-slate-500">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1 border-slate-200">
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Edit Admin User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 bg-white border-slate-200"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={formData.email} disabled className="mt-1 bg-slate-50 border-slate-200" />
            </div>
            <div>
              <Label className="mb-2 block">Roles</Label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.adminRoleIds.includes(role.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.adminRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{role.name}</p>
                      <p className="text-xs text-slate-500">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1 border-slate-200">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

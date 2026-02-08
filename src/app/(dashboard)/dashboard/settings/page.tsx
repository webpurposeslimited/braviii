'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User, Building, Shield, Users, Mail, Save, Loader2, CheckCircle,
  Plus, Trash2, Send, Eye, EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useWorkspaceStore } from '@/hooks/use-workspace';

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string; avatar: string | null };
}
interface PendingInvite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}
interface SendingAccount {
  id: string;
  name: string;
  email: string;
  type: string;
  status: string;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  dailyLimit: number;
  sentToday: number;
  createdAt: string;
}

const settingsTabs = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'workspace', label: 'Workspace', icon: Building },
  { value: 'team', label: 'Team', icon: Users },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'email', label: 'Email / SMTP', icon: Mail },
];

export default function SettingsPage() {
  const { currentWorkspace, setCurrentWorkspace, setWorkspaces } = useWorkspaceStore();

  // Profile
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Workspace
  const [wsName, setWsName] = useState('');
  const [isCreatingWs, setIsCreatingWs] = useState(false);

  // Team
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [isInviting, setIsInviting] = useState(false);

  // SMTP
  const [accounts, setAccounts] = useState<SendingAccount[]>([]);
  const [isSmtpOpen, setIsSmtpOpen] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpShowPass, setSmtpShowPass] = useState(false);
  const [smtpForm, setSmtpForm] = useState({
    name: '', email: '', smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', dailyLimit: 50,
  });

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(j => {
      if (j.data) { setProfileName(j.data.name || ''); setProfileEmail(j.data.email || ''); }
    }).catch(() => {});
  }, []);

  const fetchTeam = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/members`);
      if (res.ok) {
        const j = await res.json();
        setMembers(j.data?.members || []);
        setInvites(j.data?.invites || []);
      }
    } catch {}
  }, [currentWorkspace?.id]);

  const fetchAccounts = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/sending-accounts`);
      if (res.ok) {
        const j = await res.json();
        setAccounts(j.data || []);
      }
    } catch {}
  }, [currentWorkspace?.id]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);
  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const getInitials = (n: string) => n ? n.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  // Handlers
  const handleSaveProfile = async () => {
    setIsSavingProfile(true); setProfileMsg('');
    try {
      const res = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: profileName }) });
      setProfileMsg(res.ok ? 'Profile updated' : ((await res.json()).error?.message || 'Failed'));
    } catch { setProfileMsg('Network error'); } finally { setIsSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    setPasswordError(''); setPasswordMsg('');
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    if (newPassword.length < 8) { setPasswordError('Min 8 characters'); return; }
    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/user/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      const j = await res.json();
      if (res.ok) { setPasswordMsg('Password changed'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
      else { setPasswordError(j.error?.message || 'Failed'); }
    } catch { setPasswordError('Network error'); } finally { setIsSavingPassword(false); }
  };

  const handleCreateWorkspace = async () => {
    if (!wsName.trim()) return;
    setIsCreatingWs(true);
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: wsName }),
      });
      if (res.ok) {
        setWsName('');
        const wsRes = await fetch('/api/workspaces');
        if (wsRes.ok) {
          const wsJson = await wsRes.json();
          const list = (wsJson.data || []).map((w: any) => ({
            id: w.id, name: w.name, slug: w.slug, logo: w.logo, role: w.role,
          }));
          setWorkspaces(list);
          if (list.length > 0 && !currentWorkspace) setCurrentWorkspace(list[0]);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create workspace');
      }
    } catch {} finally { setIsCreatingWs(false); }
  };

  const handleInvite = async () => {
    if (!currentWorkspace?.id || !inviteEmail) return;
    setIsInviting(true);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/members`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) { setInviteEmail(''); fetchTeam(); }
      else { const err = await res.json(); alert(err.error || 'Failed to invite'); }
    } catch {} finally { setIsInviting(false); }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentWorkspace?.id || !confirm('Remove this member?')) return;
    try {
      await fetch(`/api/workspaces/${currentWorkspace.id}/members/${memberId}`, { method: 'DELETE' });
      fetchTeam();
    } catch {}
  };

  const handleCreateSmtp = async () => {
    if (!currentWorkspace?.id) return;
    setIsSavingSmtp(true);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/sending-accounts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpForm),
      });
      if (res.ok) {
        setIsSmtpOpen(false);
        setSmtpForm({ name: '', email: '', smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', dailyLimit: 50 });
        fetchAccounts();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create account');
      }
    } catch {} finally { setIsSavingSmtp(false); }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and workspace settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 flex-wrap h-auto p-1">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ───── Profile ───── */}
        <TabsContent value="profile">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">{getInitials(profileName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">{profileName || 'Your Name'}</p>
                  <p className="text-sm text-slate-500">{profileEmail}</p>
                </div>
              </div>
              <Separator className="bg-slate-200" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700">Display Name</Label>
                  <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Email</Label>
                  <Input value={profileEmail} disabled className="border-slate-200 bg-slate-50 text-slate-500" />
                </div>
              </div>
              {profileMsg && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> {profileMsg}
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── Workspace ───── */}
        <TabsContent value="workspace">
          <div className="space-y-6">
            {currentWorkspace ? (
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900">Current Workspace</CardTitle>
                  <CardDescription>Your active workspace details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Workspace Name</Label>
                      <Input value={currentWorkspace.name} disabled className="border-slate-200 bg-slate-50 text-slate-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700">Workspace Slug</Label>
                      <Input value={currentWorkspace.slug} disabled className="border-slate-200 bg-slate-50 text-slate-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{currentWorkspace.role}</Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No workspace yet</h3>
                  <p className="text-slate-500 mb-4 text-sm">Create a workspace to start managing leads and sequences.</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Create New Workspace</CardTitle>
                <CardDescription>Start a new workspace for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input value={wsName} onChange={(e) => setWsName(e.target.value)}
                    placeholder="My Company" className="border-slate-200 flex-1" />
                  <Button onClick={handleCreateWorkspace} disabled={isCreatingWs || !wsName.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isCreatingWs ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ───── Team ───── */}
        <TabsContent value="team">
          <div className="space-y-6">
            {!currentWorkspace ? (
              <Card className="bg-white border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-500">Create a workspace first to manage team members.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Invite Member</CardTitle>
                    <CardDescription>Add someone to your workspace</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com" className="border-slate-200 flex-1" type="email" />
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger className="w-32 bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}
                        className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isInviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Invite
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Members ({members.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {getInitials(m.user.name || m.user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{m.user.name || m.user.email}</p>
                            <p className="text-xs text-slate-500">{m.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">{m.role}</Badge>
                          {m.role !== 'OWNER' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleRemoveMember(m.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {members.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">No members found.</p>
                    )}
                  </CardContent>
                </Card>

                {invites.length > 0 && (
                  <Card className="bg-white border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-slate-900">Pending Invites ({invites.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {invites.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{inv.email}</p>
                            <p className="text-xs text-slate-500">Role: {inv.role}</p>
                          </div>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Pending</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>

        {/* ───── Security ───── */}
        <TabsContent value="security">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Change Password</CardTitle>
              <CardDescription>Update your password regularly for security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Current Password</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Confirm New Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="border-slate-200" />
              </div>
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              {passwordMsg && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> {passwordMsg}
                </div>
              )}
              <Button onClick={handleChangePassword} disabled={isSavingPassword} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSavingPassword && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── Email / SMTP ───── */}
        <TabsContent value="email">
          <div className="space-y-6">
            {!currentWorkspace ? (
              <Card className="bg-white border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-500">Create a workspace first to manage sending accounts.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-slate-900">Sending Accounts</CardTitle>
                        <CardDescription>Connect SMTP accounts for outbound email</CardDescription>
                      </div>
                      <Button onClick={() => setIsSmtpOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" /> Add SMTP Account
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {accounts.length === 0 ? (
                      <div className="text-center py-10">
                        <Mail className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm mb-2">No sending accounts connected</p>
                        <p className="text-xs text-slate-400">Add an SMTP account to start sending emails to leads.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {accounts.map((acc) => (
                          <div key={acc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-50">
                                <Mail className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{acc.name}</p>
                                <p className="text-xs text-slate-500">{acc.email} &middot; {acc.smtpHost}:{acc.smtpPort}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={
                                acc.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                              }>{acc.status}</Badge>
                              <span className="text-xs text-slate-500">{acc.sentToday}/{acc.dailyLimit} today</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Dialog open={isSmtpOpen} onOpenChange={setIsSmtpOpen}>
            <DialogContent className="bg-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-slate-900">Add SMTP Sending Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Account Name *</Label>
                    <Input value={smtpForm.name} onChange={(e) => setSmtpForm({ ...smtpForm, name: e.target.value })}
                      className="mt-1 border-slate-200" placeholder="Main Outreach" />
                  </div>
                  <div>
                    <Label>From Email *</Label>
                    <Input type="email" value={smtpForm.email} onChange={(e) => setSmtpForm({ ...smtpForm, email: e.target.value })}
                      className="mt-1 border-slate-200" placeholder="hello@company.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Host *</Label>
                    <Input value={smtpForm.smtpHost} onChange={(e) => setSmtpForm({ ...smtpForm, smtpHost: e.target.value })}
                      className="mt-1 border-slate-200" placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <Label>SMTP Port *</Label>
                    <Input type="number" value={smtpForm.smtpPort} onChange={(e) => setSmtpForm({ ...smtpForm, smtpPort: Number(e.target.value) })}
                      className="mt-1 border-slate-200" placeholder="587" />
                  </div>
                </div>
                <div>
                  <Label>SMTP Username *</Label>
                  <Input value={smtpForm.smtpUser} onChange={(e) => setSmtpForm({ ...smtpForm, smtpUser: e.target.value })}
                    className="mt-1 border-slate-200" placeholder="hello@company.com" />
                </div>
                <div>
                  <Label>SMTP Password *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input type={smtpShowPass ? 'text' : 'password'} value={smtpForm.smtpPass}
                      onChange={(e) => setSmtpForm({ ...smtpForm, smtpPass: e.target.value })}
                      className="border-slate-200 flex-1" />
                    <Button variant="outline" size="icon" onClick={() => setSmtpShowPass(!smtpShowPass)}>
                      {smtpShowPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Daily Sending Limit</Label>
                  <Input type="number" value={smtpForm.dailyLimit} onChange={(e) => setSmtpForm({ ...smtpForm, dailyLimit: Number(e.target.value) })}
                    className="mt-1 border-slate-200" placeholder="50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setIsSmtpOpen(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleCreateSmtp}
                    disabled={isSavingSmtp || !smtpForm.name || !smtpForm.email || !smtpForm.smtpHost || !smtpForm.smtpUser || !smtpForm.smtpPass}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    {isSavingSmtp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Add Account
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

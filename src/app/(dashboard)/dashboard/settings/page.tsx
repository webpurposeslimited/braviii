'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Building, Shield, Users, Mail, Save, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useWorkspaceStore } from '@/hooks/use-workspace';

const settingsTabs = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'workspace', label: 'Workspace', icon: Building },
  { value: 'team', label: 'Team', icon: Users },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'email', label: 'Email Accounts', icon: Mail },
];

export default function SettingsPage() {
  const { currentWorkspace } = useWorkspaceStore();
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(j => {
      if (j.data) { setProfileName(j.data.name || ''); setProfileEmail(j.data.email || ''); }
    }).catch(() => {});
  }, []);

  const getInitials = (n: string) => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

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

        {/* Profile */}
        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-blue-600 text-white text-2xl">
                      {getInitials(profileName)}
                    </AvatarFallback>
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
          </motion.div>
        </TabsContent>

        {/* Workspace */}
        <TabsContent value="workspace">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Workspace Settings</CardTitle>
                <CardDescription>Configure your workspace preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Workspace Name</Label>
                    <Input value={currentWorkspace?.name || ''} disabled className="border-slate-200 bg-slate-50 text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Workspace Slug</Label>
                    <Input value={currentWorkspace?.slug || ''} disabled className="border-slate-200 bg-slate-50 text-slate-500" />
                  </div>
                </div>
                <p className="text-xs text-slate-400">Workspace settings are managed by the workspace owner.</p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Team Members</CardTitle>
                <CardDescription>People in your workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(profileName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{profileName || 'You'}</p>
                      <p className="text-sm text-slate-500">{profileEmail}</p>
                    </div>
                  </div>
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700">Owner</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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
          </motion.div>
        </TabsContent>

        {/* Email Accounts */}
        <TabsContent value="email">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Email Sending Accounts</CardTitle>
                <CardDescription>Connect email accounts for outreach</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No email accounts connected</p>
                  <p className="text-xs text-slate-400">Email account integration coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

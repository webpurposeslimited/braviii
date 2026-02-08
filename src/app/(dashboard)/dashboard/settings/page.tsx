'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  Link,
  Users,
  Mail,
  Save,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const settingsTabs = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'workspace', label: 'Workspace', icon: Building },
  { value: 'team', label: 'Team', icon: Users },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'integrations', label: 'Integrations', icon: Link },
  { value: 'email', label: 'Email Accounts', icon: Mail },
];

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/60 mt-1">Manage your account and workspace settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white/5 flex-wrap h-auto p-1">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="text-white">Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent-cyan text-white text-2xl">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="glass" size="sm">Change Avatar</Button>
                    <p className="text-xs text-white/40 mt-2">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue="John" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="Doe" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue="john@company.com" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input defaultValue="Sales Manager" className="bg-white/5 border-white/10" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="cyan" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="workspace">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="text-white">Workspace Settings</CardTitle>
                <CardDescription>Configure your workspace preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Workspace Name</Label>
                    <Input defaultValue="My Company" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Workspace URL</Label>
                    <Input defaultValue="my-company" className="bg-white/5 border-white/10" />
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Danger Zone</h3>
                  <div className="p-4 border border-red-500/30 rounded-xl bg-red-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Delete Workspace</p>
                        <p className="text-sm text-white/60">
                          This will permanently delete all data in this workspace
                        </p>
                      </div>
                      <Button variant="destructive">Delete Workspace</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Email Replies</p>
                      <p className="text-sm text-white/60">Get notified when a lead replies</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Campaign Completion</p>
                      <p className="text-sm text-white/60">Notify when a campaign finishes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Weekly Reports</p>
                      <p className="text-sm text-white/60">Receive weekly analytics summary</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Low Credits Warning</p>
                      <p className="text-sm text-white/60">Alert when credits are running low</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Product Updates</p>
                      <p className="text-sm text-white/60">News about new features</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="text-white">Change Password</CardTitle>
                <CardDescription>Update your password regularly for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" className="bg-white/5 border-white/10" />
                </div>
                <Button variant="cyan">Update Password</Button>
              </CardContent>
            </Card>

            <Card glass>
              <CardHeader>
                <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">2FA Status</p>
                    <p className="text-sm text-white/60">Currently disabled</p>
                  </div>
                  <Button variant="glass">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>

            <Card glass>
              <CardHeader>
                <CardTitle className="text-white">Active Sessions</CardTitle>
                <CardDescription>Manage your active login sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Current Session</p>
                      <p className="text-sm text-white/60">Chrome on Windows • San Francisco, CA</p>
                    </div>
                    <span className="text-xs text-blue-400">Active now</span>
                  </div>
                </div>
                <Button variant="ghost" className="mt-4 text-red-400">
                  Sign out all other sessions
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="team">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card glass>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Team Members</CardTitle>
                    <CardDescription>Manage your workspace team</CardDescription>
                  </div>
                  <Button variant="cyan">Invite Member</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent-cyan text-white">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">John Doe</p>
                        <p className="text-sm text-white/60">john@company.com</p>
                      </div>
                    </div>
                    <span className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary-400">
                      Owner
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="integrations">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="text-white">Integrations</CardTitle>
                <CardDescription>Connect third-party services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 font-bold">A</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Apollo</p>
                      <p className="text-sm text-white/60">Lead sourcing and enrichment</p>
                    </div>
                  </div>
                  <Button variant="glass">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <span className="text-red-400 font-bold">G</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Google Maps</p>
                      <p className="text-sm text-white/60">Find local businesses</p>
                    </div>
                  </div>
                  <Button variant="glass">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold">S</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Google Sheets</p>
                      <p className="text-sm text-white/60">Sync data with spreadsheets</p>
                    </div>
                  </div>
                  <Button variant="glass">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="email">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card glass>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Email Sending Accounts</CardTitle>
                    <CardDescription>Connect email accounts for outreach</CardDescription>
                  </div>
                  <Button variant="cyan">Add Account</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">No email accounts connected</p>
                  <Button variant="glass">Connect Gmail or Outlook</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

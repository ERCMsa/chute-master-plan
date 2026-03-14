import { useState } from 'react';
import { getUsers, saveUsers, getLanguage, setLanguage as saveLanguage } from '@/lib/store';
import { User, UserRole, ROLE_LABELS } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Edit, Settings, Users, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

export default function SettingsPage() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState(getUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'engineer' as UserRole, unit: 'unit1' as 'unit1' | 'unit2' });
  const [language, setLang] = useState(getLanguage);

  const canManageUsers = hasPermission('users');

  const openNew = () => {
    setEditing(null);
    setForm({ username: '', password: '', fullName: '', role: 'engineer', unit: 'unit1' });
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ username: u.username, password: u.password, fullName: u.fullName, role: u.role, unit: u.unit || 'unit1' });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.username || !form.password || !form.fullName) { toast.error('Fill all fields'); return; }
    let updated: User[];
    if (editing) {
      updated = users.map(u => u.id === editing.id ? { ...u, ...form } : u);
    } else {
      const newUser: User = { id: crypto.randomUUID(), ...form, active: true };
      updated = [...users, newUser];
    }
    setUsers(updated);
    saveUsers(updated);
    setDialogOpen(false);
    toast.success(editing ? 'User updated' : 'User created');
  };

  const toggleActive = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    setUsers(updated);
    saveUsers(updated);
  };

  const handleLanguageChange = (lang: string) => {
    setLang(lang);
    saveLanguage(lang);
    toast.success('Language updated');
  };

  const needsUnit = ['unit1_manager', 'unit2_manager', 'engineer', 'worker'].includes(form.role);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
      </div>

      <Tabs defaultValue={canManageUsers ? 'users' : 'general'} className="space-y-4">
        <TabsList>
          {canManageUsers && (
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
          )}
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" /> Language
          </TabsTrigger>
        </TabsList>

        {canManageUsers && (
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">User Management</h3>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openNew} className="btn-industrial red-gradient gap-2">
                    <PlusCircle className="h-5 w-5" /> Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editing ? 'Edit User' : 'Create User'}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Full Name</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="h-12" /></div>
                    <div><Label>Username</Label><Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="h-12" /></div>
                    <div><Label>Password</Label><Input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="h-12" /></div>
                    <div>
                      <Label>Role</Label>
                      <Select value={form.role} onValueChange={v => setForm({ ...form, role: v as UserRole })}>
                        <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {needsUnit && (
                      <div>
                        <Label>Production Unit</Label>
                        <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v as 'unit1' | 'unit2' })}>
                          <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unit1">Unit 1</SelectItem>
                            <SelectItem value="unit2">Unit 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button onClick={handleSave} className="w-full btn-industrial red-gradient">{editing ? 'Update' : 'Create'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full text-sm table-industrial">
                <thead>
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Username</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Unit</th>
                    <th className="p-3 text-center">Active</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t hover:bg-accent/50">
                      <td className="p-3 font-medium text-foreground">{u.fullName}</td>
                      <td className="p-3 font-mono text-foreground">{u.username}</td>
                      <td className="p-3"><Badge variant="secondary">{ROLE_LABELS[u.role]}</Badge></td>
                      <td className="p-3 text-foreground">{u.unit ? (u.unit === 'unit1' ? 'Unit 1' : 'Unit 2') : '—'}</td>
                      <td className="p-3 text-center">
                        <Switch checked={u.active} onCheckedChange={() => toggleActive(u.id)} />
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={() => openEdit(u)} className="gap-1">
                          <Edit className="h-4 w-4" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        )}

        <TabsContent value="general" className="space-y-4">
          <div className="bg-card rounded-lg border p-6 max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-4">Language / اللغة</h3>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => (
                  <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-3">
              Interface language preference. Full translation support coming soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

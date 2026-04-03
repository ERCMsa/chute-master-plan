import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, User } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABELS: Record<string, string> = {
  engineer: 'Engineer',
  magazinier: 'Magazinier',
  stock_manager: 'Stock Manager',
};

export default function SettingsPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const isManager = profile?.role === 'stock_manager';

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('display_name');
      if (error) throw error;
      return data;
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editName, setEditName] = useState('');

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditRole(p.role);
    setEditName(p.display_name);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: editRole as any, display_name: editName })
        .eq('id', editingId);
      if (error) throw error;
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['profiles'] });
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
      </div>

      <Tabs defaultValue={isManager ? 'users' : 'profile'} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> My Profile</TabsTrigger>
          {isManager && <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> User Management</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <div className="bg-card rounded-lg border p-6 max-w-md space-y-4">
            <div>
              <Label>Display Name</Label>
              <p className="text-lg font-medium text-foreground">{profile?.display_name || '—'}</p>
            </div>
            <div>
              <Label>Role</Label>
              <Badge variant="secondary" className="mt-1">{ROLE_LABELS[profile?.role || ''] || profile?.role}</Badge>
            </div>
          </div>
        </TabsContent>

        {isManager && (
          <TabsContent value="users" className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">All Users</h3>
            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full text-sm table-industrial">
                <thead>
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Joined</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allProfiles.map((p: any) => (
                    <tr key={p.id} className="border-t hover:bg-accent/50">
                      <td className="p-3">
                        {editingId === p.id ? (
                          <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-10" />
                        ) : (
                          <span className="font-medium text-foreground">{p.display_name || '—'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {editingId === p.id ? (
                          <Select value={editRole} onValueChange={setEditRole}>
                            <SelectTrigger className="h-10 w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(ROLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="secondary">{ROLE_LABELS[p.role] || p.role}</Badge>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        {editingId === p.id ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEdit} className="bg-success text-success-foreground">Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

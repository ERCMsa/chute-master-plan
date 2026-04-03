import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollText } from 'lucide-react';

export default function AuditLogPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*, profiles:user_id(display_name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const actionLabels: Record<string, { label: string; color: string }> = {
    demand_approved: { label: 'Demand Approved', color: 'bg-success/20 text-success' },
    demand_rejected: { label: 'Demand Rejected', color: 'bg-destructive/20 text-destructive' },
    supply_approved: { label: 'Supply Approved', color: 'bg-success/20 text-success' },
    supply_rejected: { label: 'Supply Rejected', color: 'bg-destructive/20 text-destructive' },
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Audit Log</h2>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm table-industrial">
          <thead>
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => {
              const info = actionLabels[log.action] || { label: log.action, color: 'bg-muted text-foreground' };
              return (
                <tr key={log.id} className="border-t hover:bg-accent/50">
                  <td className="p-3 text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-3 font-medium text-foreground">{log.profiles?.display_name || '—'}</td>
                  <td className="p-3"><Badge className={info.color}>{info.label}</Badge></td>
                </tr>
              );
            })}
            {logs.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No audit entries</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

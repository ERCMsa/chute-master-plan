import { useStock } from '@/hooks/useStock';
import { useDemandLists } from '@/hooks/useLists';
import { useSupplyLists } from '@/hooks/useLists';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Clock, CheckCircle, AlertTriangle, FileText, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { data: stock = [] } = useStock();
  const { data: demands = [] } = useDemandLists();
  const { data: supplies = [] } = useSupplyLists();

  const totalItems = stock.reduce((s, i) => s + i.quantity, 0);
  const uniqueItems = stock.length;
  const lowStock = stock.filter(i => i.quantity <= i.min_quantity && i.quantity > 0).length;
  const outOfStock = stock.filter(i => i.quantity === 0).length;
  const pendingDemands = demands.filter(d => d.status === 'pending').length;
  const pendingSupplies = supplies.filter(s => s.status === 'pending').length;

  const cards = [
    { label: 'Total Quantity', value: totalItems, icon: Package, color: 'bg-secondary' },
    { label: 'Unique Items', value: uniqueItems, icon: TrendingUp, color: 'bg-primary' },
    { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'bg-warning' },
    { label: 'Out of Stock', value: outOfStock, icon: AlertTriangle, color: 'bg-destructive' },
    { label: 'Pending Demands', value: pendingDemands, icon: FileText, color: 'bg-info' },
    { label: 'Pending Supplies', value: pendingSupplies, icon: Clock, color: 'bg-success' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome, {profile?.display_name || 'User'}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(card => (
          <div key={card.label} className="stat-card flex flex-col">
            <div className={`${card.color} text-secondary-foreground p-2 rounded-lg w-fit mb-3`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Recent Demand Lists
          </h3>
          {demands.slice(0, 5).map(d => (
            <div key={d.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
              <span className="text-foreground">{d.profiles?.display_name || 'Unknown'}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                d.status === 'pending' ? 'bg-warning/20 text-warning' :
                d.status === 'approved' ? 'bg-success/20 text-success' :
                'bg-destructive/20 text-destructive'
              }`}>{d.status}</span>
            </div>
          ))}
          {demands.length === 0 && <p className="text-sm text-muted-foreground">No demand lists yet</p>}
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" /> Recent Supply Lists
          </h3>
          {supplies.slice(0, 5).map(s => (
            <div key={s.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
              <span className="text-foreground">{s.profiles?.display_name || 'Unknown'}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                s.status === 'pending' ? 'bg-warning/20 text-warning' :
                s.status === 'approved' ? 'bg-success/20 text-success' :
                'bg-destructive/20 text-destructive'
              }`}>{s.status}</span>
            </div>
          ))}
          {supplies.length === 0 && <p className="text-sm text-muted-foreground">No supply lists yet</p>}
        </div>
      </div>
    </div>
  );
}

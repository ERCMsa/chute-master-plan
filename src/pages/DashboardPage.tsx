import { useMemo } from 'react';
import { getChutes, getRequests } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { Package, CheckCircle, Clock, ArchiveX, FileText, TrendingUp, DollarSign, Layers } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const chutes = getChutes();
  const requests = getRequests();

  const stats = useMemo(() => {
    const available = chutes.filter(c => c.status === 'Available').length;
    const reserved = chutes.filter(c => c.status === 'Reserved').length;
    const used = chutes.filter(c => c.status === 'Used').length;
    const pending = requests.filter(r => r.status === 'Pending').length;

    // Most used steel types
    const steelCount: Record<string, number> = {};
    chutes.filter(c => c.status === 'Used').forEach(c => {
      steelCount[c.steelType] = (steelCount[c.steelType] || 0) + 1;
    });
    const topSteel = Object.entries(steelCount).sort((a, b) => b[1] - a[1]);

    // Cost savings estimate (avg €50/piece reused)
    const savings = used * 50;

    return { total: chutes.length, available, reserved, used, pending, topSteel, savings };
  }, [chutes, requests]);

  const cards = [
    { label: 'Total Chutes', value: stats.total, icon: Package, color: 'bg-secondary' },
    { label: 'Available', value: stats.available, icon: CheckCircle, color: 'bg-success' },
    { label: 'Reserved', value: stats.reserved, icon: Clock, color: 'bg-warning' },
    { label: 'Used', value: stats.used, icon: ArchiveX, color: 'bg-muted-foreground' },
    { label: 'Pending Requests', value: stats.pending, icon: FileText, color: 'bg-primary' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {user?.fullName}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(card => (
          <div key={card.label} className="stat-card flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className={`${card.color} text-secondary-foreground p-2 rounded-lg`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Stats section */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Most Reused Steel</h3>
          </div>
          {stats.topSteel.length > 0 ? (
            <ul className="space-y-2">
              {stats.topSteel.map(([type, count]) => (
                <li key={type} className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">{type}</span>
                  <span className="text-muted-foreground">{count} pieces</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No reused pieces yet</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-foreground">Estimated Savings</h3>
          </div>
          <p className="text-3xl font-bold text-success">€{stats.savings.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">From {stats.used} reused pieces</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-5 w-5 text-info" />
            <h3 className="font-semibold text-foreground">Inventory Capacity</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.total}/200</p>
          <div className="w-full bg-muted rounded-full h-3 mt-3">
            <div
              className="red-gradient h-3 rounded-full transition-all"
              style={{ width: `${Math.min((stats.total / 200) * 100, 100)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{Math.round((stats.total / 200) * 100)}% used</p>
        </div>
      </div>
    </div>
  );
}

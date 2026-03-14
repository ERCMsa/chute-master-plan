import { useMemo } from 'react';
import { getChutes, getRequests } from '@/lib/store';
import { BarChart3, TrendingUp, Recycle } from 'lucide-react';

export default function StatisticsPage() {
  const chutes = getChutes();
  const requests = getRequests();

  const stats = useMemo(() => {
    const used = chutes.filter(c => c.status === 'Used');
    const thisMonth = used.filter(c => {
      const d = new Date(c.dateAdded);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const profileCount: Record<string, number> = {};
    used.forEach(c => {
      const key = `${c.steelType} ${c.sectionSize}`;
      profileCount[key] = (profileCount[key] || 0) + 1;
    });
    const topProfiles = Object.entries(profileCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const typeCount: Record<string, number> = {};
    used.forEach(c => { typeCount[c.steelType] = (typeCount[c.steelType] || 0) + 1; });
    const topTypes = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);

    return {
      totalReused: used.length,
      thisMonthReused: thisMonth.length,
      topProfiles,
      topTypes,
      deliveredRequests: requests.filter(r => r.status === 'Delivered').length,
    };
  }, [chutes, requests]);

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Scrap Reuse Statistics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <Recycle className="h-6 w-6 text-success mb-2" />
          <p className="text-3xl font-bold text-foreground">{stats.totalReused}</p>
          <p className="text-sm text-muted-foreground">Total Pieces Reused</p>
        </div>
        <div className="stat-card">
          <TrendingUp className="h-6 w-6 text-primary mb-2" />
          <p className="text-3xl font-bold text-foreground">{stats.thisMonthReused}</p>
          <p className="text-sm text-muted-foreground">Reused This Month</p>
        </div>
        <div className="stat-card">
          <BarChart3 className="h-6 w-6 text-info mb-2" />
          <p className="text-3xl font-bold text-foreground">{stats.deliveredRequests}</p>
          <p className="text-sm text-muted-foreground">Delivered Requests</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-bold text-foreground mb-4">Most Reused Steel Types</h3>
          {stats.topTypes.length > 0 ? (
            <div className="space-y-3">
              {stats.topTypes.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-20">{type}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div className="red-gradient h-full rounded-full flex items-center pl-3" style={{ width: `${Math.max((count / stats.totalReused) * 100, 15)}%` }}>
                      <span className="text-xs font-bold text-primary-foreground">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground text-sm">No data yet</p>}
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-bold text-foreground mb-4">Most Requested Profiles</h3>
          {stats.topProfiles.length > 0 ? (
            <ul className="space-y-2">
              {stats.topProfiles.map(([profile, count], i) => (
                <li key={profile} className="flex justify-between text-sm py-2 border-b last:border-0">
                  <span className="text-foreground font-medium">{i + 1}. {profile}</span>
                  <span className="text-muted-foreground">{count} pieces</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted-foreground text-sm">No data yet</p>}
        </div>
      </div>
    </div>
  );
}

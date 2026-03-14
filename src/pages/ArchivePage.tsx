import { useState, useMemo } from 'react';
import { getChutes, getRequests } from '@/lib/store';
import { STEEL_TYPES } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Archive, MapPin } from 'lucide-react';

export default function ArchivePage() {
  const chutes = getChutes();
  const requests = getRequests();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Used chutes = delivered pieces
  const archivedChutes = useMemo(() => {
    return chutes.filter(c => {
      if (c.status !== 'Used') return false;
      if (filterType !== 'all' && c.steelType !== filterType) return false;
      if (search) {
        const s = search.toLowerCase();
        return c.id.toLowerCase().includes(s) ||
          c.steelType.toLowerCase().includes(s) ||
          c.sectionSize.toLowerCase().includes(s) ||
          c.length.toString().includes(s);
      }
      return true;
    });
  }, [chutes, search, filterType]);

  // Find which request delivered each chute
  const getChuteRequest = (chuteId: string) => {
    return requests.find(r => r.chuteIds.includes(chuteId) && r.status === 'Delivered');
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <Archive className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Archive — Delivered Pieces</h2>
      </div>

      <div className="flex flex-wrap gap-3 items-center bg-card p-4 rounded-lg border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search archived pieces..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-11" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px] h-11"><SelectValue placeholder="Steel Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {STEEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{archivedChutes.length} delivered pieces</p>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm table-industrial">
          <thead>
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Section</th>
              <th className="p-3 text-right">Length (mm)</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Transfer #</th>
              <th className="p-3 text-left">Delivered To</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {archivedChutes.map(c => {
              const req = getChuteRequest(c.id);
              return (
                <tr key={c.id} className="border-t hover:bg-accent/50 transition-colors">
                  <td className="p-3 font-mono font-medium text-foreground">{c.id}</td>
                  <td className="p-3 font-semibold text-foreground">{c.steelType}</td>
                  <td className="p-3 text-foreground">{c.steelType} {c.sectionSize}</td>
                  <td className="p-3 text-right font-mono text-foreground">{c.length}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-foreground">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {c.locationCode}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-foreground">{req?.transferNumber || '—'}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{req ? (req.unit === 'unit1' ? 'Unit 1' : 'Unit 2') : '—'}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{req?.dateDelivered || c.dateAdded}</td>
                </tr>
              );
            })}
            {archivedChutes.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No archived pieces yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

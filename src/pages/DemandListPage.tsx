import { useState } from 'react';
import { useStock } from '@/hooks/useStock';
import { useDemandLists, useDemandListItems, useCreateDemandList } from '@/hooks/useLists';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Send, Trash2, Eye, Package } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  approved: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive',
};

export default function DemandListPage() {
  const { profile } = useAuth();
  const isEngineer = profile?.role === 'engineer';
  const { data: stock = [] } = useStock();
  const { data: demands = [], isLoading } = useDemandLists();
  const createDemand = useCreateDemandList();

  const [createOpen, setCreateOpen] = useState(false);
  const [items, setItems] = useState<{ stock_id: string; requested_quantity: number }[]>([]);
  const [viewId, setViewId] = useState<string | null>(null);
  const { data: viewItems = [] } = useDemandListItems(viewId);

  const addItem = () => setItems([...items, { stock_id: '', requested_quantity: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    const valid = items.filter(i => i.stock_id && i.requested_quantity > 0);
    if (valid.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    // Check stock availability
    for (const item of valid) {
      const s = stock.find(si => si.id === item.stock_id);
      if (s && item.requested_quantity > s.quantity) {
        toast.error(`Requested ${item.requested_quantity} of "${s.item_name}" but only ${s.quantity} available`);
        return;
      }
    }
    try {
      await createDemand.mutateAsync(valid);
      toast.success('Demand list submitted for validation');
      setItems([]);
      setCreateOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const availableStock = stock.filter(s => s.quantity > 0);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">Demand Lists</h2>
        {isEngineer && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-industrial red-gradient gap-2">
                <PlusCircle className="h-5 w-5" /> New Demand List
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Demand List</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground mb-4">Select items from stock and specify quantities needed.</p>

              {items.map((item, i) => {
                const selectedStock = stock.find(s => s.id === item.stock_id);
                return (
                  <div key={i} className="flex gap-3 items-end mb-3 p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <Select value={item.stock_id} onValueChange={v => updateItem(i, 'stock_id', v)}>
                        <SelectTrigger className="h-11"><SelectValue placeholder="Select item" /></SelectTrigger>
                        <SelectContent>
                          {availableStock.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.item_name} {s.item_type && `(${s.item_type})`} — Qty: {s.quantity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        min={1}
                        max={selectedStock?.quantity || 999}
                        value={item.requested_quantity}
                        onChange={e => updateItem(i, 'requested_quantity', parseInt(e.target.value) || 1)}
                        className="h-11"
                        placeholder="Qty"
                      />
                    </div>
                    <Button size="icon" variant="destructive" onClick={() => removeItem(i)} className="h-11 w-11">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              <Button variant="outline" onClick={addItem} className="w-full gap-2 h-11">
                <PlusCircle className="h-4 w-4" /> Add Item
              </Button>

              <Button onClick={handleSubmit} disabled={createDemand.isPending || items.length === 0} className="w-full mt-4 btn-industrial red-gradient gap-2">
                <Send className="h-5 w-5" /> Submit for Validation
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* List of demands */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm table-industrial">
          <thead>
            <tr>
              <th className="p-3 text-left">Created By</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-left">Validated</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {demands.map(d => (
              <tr key={d.id} className="border-t hover:bg-accent/50">
                <td className="p-3 font-medium text-foreground">{d.profiles?.display_name || '—'}</td>
                <td className="p-3 text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-center">
                  <Badge className={STATUS_STYLE[d.status]}>{d.status}</Badge>
                </td>
                <td className="p-3 text-muted-foreground">{d.validated_at ? new Date(d.validated_at).toLocaleDateString() : '—'}</td>
                <td className="p-3">
                  <Button size="sm" variant="outline" onClick={() => setViewId(d.id)} className="gap-1">
                    <Eye className="h-4 w-4" /> View
                  </Button>
                </td>
              </tr>
            ))}
            {demands.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No demand lists</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View items dialog */}
      <Dialog open={!!viewId} onOpenChange={() => setViewId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Demand List Items</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {viewItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{item.stock?.item_name || 'Unknown'}</span>
                  {item.stock?.item_type && <span className="text-muted-foreground text-xs">({item.stock.item_type})</span>}
                </div>
                <Badge variant="secondary">Qty: {item.requested_quantity}</Badge>
              </div>
            ))}
            {viewItems.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No items</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

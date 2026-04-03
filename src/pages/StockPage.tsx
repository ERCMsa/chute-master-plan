import { useState } from 'react';
import { useStock, useAddStock, useUpdateStock, useDeleteStock, StockItem } from '@/hooks/useStock';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function StockPage() {
  const { profile } = useAuth();
  const isManager = profile?.role === 'stock_manager';
  const { data: stock = [], isLoading } = useStock();
  const addStock = useAddStock();
  const updateStock = useUpdateStock();
  const deleteStock = useDeleteStock();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [form, setForm] = useState({ item_name: '', item_type: '', length: '', width: '', thickness: '', quantity: '', min_quantity: '0' });

  const filtered = stock.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.item_name.toLowerCase().includes(q) || s.item_type.toLowerCase().includes(q);
  });

  const openNew = () => {
    setEditing(null);
    setForm({ item_name: '', item_type: '', length: '', width: '', thickness: '', quantity: '', min_quantity: '0' });
    setDialogOpen(true);
  };

  const openEdit = (item: StockItem) => {
    setEditing(item);
    setForm({
      item_name: item.item_name,
      item_type: item.item_type,
      length: item.length?.toString() || '',
      width: item.width?.toString() || '',
      thickness: item.thickness?.toString() || '',
      quantity: item.quantity.toString(),
      min_quantity: item.min_quantity.toString(),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.item_name || !form.quantity) {
      toast.error('Name and quantity are required');
      return;
    }
    const payload = {
      item_name: form.item_name,
      item_type: form.item_type,
      length: form.length ? parseFloat(form.length) : null,
      width: form.width ? parseFloat(form.width) : null,
      thickness: form.thickness ? parseFloat(form.thickness) : null,
      quantity: parseInt(form.quantity),
      min_quantity: parseInt(form.min_quantity) || 0,
    };
    try {
      if (editing) {
        await updateStock.mutateAsync({ id: editing.id, ...payload });
        toast.success('Item updated');
      } else {
        await addStock.mutateAsync(payload);
        toast.success('Item added to stock');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stock item?')) return;
    try {
      await deleteStock.mutateAsync(id);
      toast.success('Item deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading stock...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">Main Stock</h2>
        {isManager && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="btn-industrial red-gradient gap-2">
                <PlusCircle className="h-5 w-5" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit Stock Item' : 'Add Stock Item'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Item Name *</Label><Input value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} className="h-12" placeholder="e.g. IPE 200" /></div>
                <div><Label>Type</Label><Input value={form.item_type} onChange={e => setForm({ ...form, item_type: e.target.value })} className="h-12" placeholder="e.g. HEA, IPE, UPN" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Length (mm)</Label><Input type="number" value={form.length} onChange={e => setForm({ ...form, length: e.target.value })} className="h-12" /></div>
                  <div><Label>Width (mm)</Label><Input type="number" value={form.width} onChange={e => setForm({ ...form, width: e.target.value })} className="h-12" /></div>
                  <div><Label>Thickness (mm)</Label><Input type="number" value={form.thickness} onChange={e => setForm({ ...form, thickness: e.target.value })} className="h-12" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Quantity *</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="h-12" /></div>
                  <div><Label>Min Quantity (alert)</Label><Input type="number" value={form.min_quantity} onChange={e => setForm({ ...form, min_quantity: e.target.value })} className="h-12" /></div>
                </div>
                <Button onClick={handleSave} className="w-full btn-industrial red-gradient" disabled={addStock.isPending || updateStock.isPending}>
                  {editing ? 'Update' : 'Add to Stock'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-3 items-center bg-card p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-11" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm table-industrial">
          <thead>
            <tr>
              <th className="p-3 text-left">Item Name</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-right">Length</th>
              <th className="p-3 text-right">Width</th>
              <th className="p-3 text-right">Thickness</th>
              <th className="p-3 text-right">Quantity</th>
              <th className="p-3 text-center">Status</th>
              {isManager && <th className="p-3 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-t hover:bg-accent/50">
                <td className="p-3 font-medium text-foreground">{item.item_name}</td>
                <td className="p-3 text-foreground">{item.item_type}</td>
                <td className="p-3 text-right font-mono text-foreground">{item.length ?? '—'}</td>
                <td className="p-3 text-right font-mono text-foreground">{item.width ?? '—'}</td>
                <td className="p-3 text-right font-mono text-foreground">{item.thickness ?? '—'}</td>
                <td className="p-3 text-right font-bold text-foreground">{item.quantity}</td>
                <td className="p-3 text-center">
                  {item.quantity === 0 ? (
                    <Badge className="bg-destructive text-destructive-foreground">Out of Stock</Badge>
                  ) : item.quantity <= item.min_quantity ? (
                    <Badge className="bg-warning text-warning-foreground gap-1"><AlertTriangle className="h-3 w-3" /> Low</Badge>
                  ) : (
                    <Badge className="bg-success text-success-foreground">In Stock</Badge>
                  )}
                </td>
                {isManager && (
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No stock items found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

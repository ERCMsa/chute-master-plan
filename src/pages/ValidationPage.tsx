import { useState } from 'react';
import { useDemandLists, useSupplyLists, useDemandListItems, useSupplyListItems, useValidateList } from '@/hooks/useLists';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Eye, Package, FileText, Truck } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  approved: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive',
};

export default function ValidationPage() {
  const { data: demands = [] } = useDemandLists();
  const { data: supplies = [] } = useSupplyLists();
  const validate = useValidateList();

  const [viewDemandId, setViewDemandId] = useState<string | null>(null);
  const [viewSupplyId, setViewSupplyId] = useState<string | null>(null);
  const { data: demandItems = [] } = useDemandListItems(viewDemandId);
  const { data: supplyItems = [] } = useSupplyListItems(viewSupplyId);

  const pendingDemands = demands.filter(d => d.status === 'pending');
  const pendingSupplies = supplies.filter(s => s.status === 'pending');

  const handleValidate = async (type: 'demand' | 'supply', id: string, action: 'approved' | 'rejected') => {
    try {
      await validate.mutateAsync({ type, id, action });
      toast.success(`List ${action}`);
      setViewDemandId(null);
      setViewSupplyId(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Validation Dashboard</h2>
      <p className="text-muted-foreground">
        {pendingDemands.length + pendingSupplies.length} pending list(s) waiting for your review
      </p>

      <Tabs defaultValue="demands" className="space-y-4">
        <TabsList>
          <TabsTrigger value="demands" className="gap-2">
            <FileText className="h-4 w-4" /> Demand Lists
            {pendingDemands.length > 0 && (
              <Badge className="bg-destructive text-destructive-foreground ml-1">{pendingDemands.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="supplies" className="gap-2">
            <Truck className="h-4 w-4" /> Supply Lists
            {pendingSupplies.length > 0 && (
              <Badge className="bg-destructive text-destructive-foreground ml-1">{pendingSupplies.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demands">
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm table-industrial">
              <thead>
                <tr>
                  <th className="p-3 text-left">Engineer</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {demands.map(d => (
                  <tr key={d.id} className="border-t hover:bg-accent/50">
                    <td className="p-3 font-medium text-foreground">{d.profiles?.display_name || '—'}</td>
                    <td className="p-3 text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-center"><Badge className={STATUS_STYLE[d.status]}>{d.status}</Badge></td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setViewDemandId(d.id)} className="gap-1">
                          <Eye className="h-4 w-4" /> View
                        </Button>
                        {d.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleValidate('demand', d.id, 'approved')} className="bg-success text-success-foreground hover:bg-success/90 gap-1" disabled={validate.isPending}>
                              <Check className="h-4 w-4" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleValidate('demand', d.id, 'rejected')} disabled={validate.isPending} className="gap-1">
                              <X className="h-4 w-4" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {demands.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No demand lists</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="supplies">
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm table-industrial">
              <thead>
                <tr>
                  <th className="p-3 text-left">Magazinier</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplies.map(s => (
                  <tr key={s.id} className="border-t hover:bg-accent/50">
                    <td className="p-3 font-medium text-foreground">{s.profiles?.display_name || '—'}</td>
                    <td className="p-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-center"><Badge className={STATUS_STYLE[s.status]}>{s.status}</Badge></td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setViewSupplyId(s.id)} className="gap-1">
                          <Eye className="h-4 w-4" /> View
                        </Button>
                        {s.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleValidate('supply', s.id, 'approved')} className="bg-success text-success-foreground hover:bg-success/90 gap-1" disabled={validate.isPending}>
                              <Check className="h-4 w-4" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleValidate('supply', s.id, 'rejected')} disabled={validate.isPending} className="gap-1">
                              <X className="h-4 w-4" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {supplies.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No supply lists</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Demand items dialog */}
      <Dialog open={!!viewDemandId} onOpenChange={() => setViewDemandId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Demand List Items</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {demandItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{item.stock?.item_name || 'Unknown'}</span>
                  <span className="text-muted-foreground text-xs">Available: {item.stock?.quantity}</span>
                </div>
                <Badge variant="secondary">Requested: {item.requested_quantity}</Badge>
              </div>
            ))}
          </div>
          {viewDemandId && demands.find(d => d.id === viewDemandId)?.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Button onClick={() => handleValidate('demand', viewDemandId!, 'approved')} className="flex-1 bg-success text-success-foreground hover:bg-success/90 gap-1" disabled={validate.isPending}>
                <Check className="h-4 w-4" /> Approve
              </Button>
              <Button variant="destructive" onClick={() => handleValidate('demand', viewDemandId!, 'rejected')} className="flex-1 gap-1" disabled={validate.isPending}>
                <X className="h-4 w-4" /> Reject
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Supply items dialog */}
      <Dialog open={!!viewSupplyId} onOpenChange={() => setViewSupplyId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supply List Items</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {supplyItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-success" />
                  <span className="font-medium text-foreground">{item.stock?.item_name || 'Unknown'}</span>
                </div>
                <Badge variant="secondary">Qty: {item.supplied_quantity}</Badge>
              </div>
            ))}
          </div>
          {viewSupplyId && supplies.find(s => s.id === viewSupplyId)?.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Button onClick={() => handleValidate('supply', viewSupplyId!, 'approved')} className="flex-1 bg-success text-success-foreground hover:bg-success/90 gap-1" disabled={validate.isPending}>
                <Check className="h-4 w-4" /> Approve
              </Button>
              <Button variant="destructive" onClick={() => handleValidate('supply', viewSupplyId!, 'rejected')} className="flex-1 gap-1" disabled={validate.isPending}>
                <X className="h-4 w-4" /> Reject
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { getRequests, saveRequests, getChutes, saveChutes } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { TransferRequest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Truck, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { generateTransferPDF } from '@/lib/pdf';
import { addNotification } from '@/lib/notifications';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-warning text-warning-foreground',
  Approved: 'bg-info text-info-foreground',
  Delivered: 'bg-success text-success-foreground',
  Cancelled: 'bg-destructive text-destructive-foreground',
};

export default function RequestsPage() {
  const { user, hasPermission } = useAuth();
  const [requests, setRequests] = useState(getRequests);
  const chutes = getChutes();

  const canApprove = hasPermission('approve_request');
  const canDeliver = hasPermission('deliver_request');

  const visibleRequests = requests.filter(r => {
    if (user?.role === 'unit1_manager') return r.unit === 'unit1';
    if (user?.role === 'unit2_manager') return r.unit === 'unit2';
    if (user?.role === 'engineer' || user?.role === 'worker') return r.requesterId === user.id;
    return true;
  });

  const updateRequest = (id: string, updates: Partial<TransferRequest>) => {
    const updated = requests.map(r => r.id === id ? { ...r, ...updates } : r);
    setRequests(updated);
    saveRequests(updated);
  };

  const handleApprove = (req: TransferRequest) => {
    updateRequest(req.id, { status: 'Approved', dateApproved: new Date().toISOString().split('T')[0] });
    // Reserve chutes
    const allChutes = getChutes();
    req.chuteIds.forEach(cid => {
      const c = allChutes.find(x => x.id === cid);
      if (c) c.status = 'Reserved';
    });
    saveChutes(allChutes);
    addNotification({
      type: 'request_approved',
      title: 'Request Approved',
      message: `${req.transferNumber} approved (${req.chuteIds.length} pieces)`,
      forRoles: ['store_manager', 'production_manager', 'unit1_manager', 'unit2_manager', 'engineer', 'worker'],
    });
    toast.success(`Request ${req.transferNumber} approved`);
  };

  const handleDeliver = (req: TransferRequest) => {
    updateRequest(req.id, { status: 'Delivered', dateDelivered: new Date().toISOString().split('T')[0] });
    const allChutes = getChutes();
    req.chuteIds.forEach(cid => {
      const c = allChutes.find(x => x.id === cid);
      if (c) c.status = 'Used';
    });
    saveChutes(allChutes);
    addNotification({
      type: 'request_delivered',
      title: 'Request Delivered',
      message: `${req.transferNumber} delivered to ${req.unit === 'unit1' ? 'Unit 1' : 'Unit 2'}`,
      forRoles: ['store_manager', 'production_manager', 'unit1_manager', 'unit2_manager', 'engineer', 'worker'],
    });
    toast.success(`Request ${req.transferNumber} delivered`);
  };

  const handleCancel = (req: TransferRequest) => {
    updateRequest(req.id, { status: 'Cancelled' });
    if (req.status === 'Approved') {
      const allChutes = getChutes();
      req.chuteIds.forEach(cid => {
        const c = allChutes.find(x => x.id === cid);
        if (c && c.status === 'Reserved') c.status = 'Available';
      });
      saveChutes(allChutes);
    }
    toast.success(`Request ${req.transferNumber} cancelled`);
  };

  const handlePDF = (req: TransferRequest) => {
    const reqChutes = chutes.filter(c => req.chuteIds.includes(c.id));
    generateTransferPDF(req, reqChutes);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Transfer Requests</h2>

      {visibleRequests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No transfer requests yet</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm table-industrial">
            <thead>
              <tr>
                <th className="p-3 text-left">Transfer #</th>
                <th className="p-3 text-left">Requester</th>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-center">Pieces</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map(req => (
                <tr key={req.id} className="border-t hover:bg-accent/50">
                  <td className="p-3 font-mono font-bold text-foreground">{req.transferNumber}</td>
                  <td className="p-3 text-foreground">{req.requesterName}</td>
                  <td className="p-3 text-foreground">{req.unit === 'unit1' ? 'Unit 1' : 'Unit 2'}</td>
                  <td className="p-3 text-center font-bold text-foreground">{req.chuteIds.length}</td>
                  <td className="p-3"><Badge className={STATUS_COLORS[req.status]}>{req.status}</Badge></td>
                  <td className="p-3 text-muted-foreground">{req.dateCreated}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {canApprove && req.status === 'Pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(req)} className="bg-success text-success-foreground hover:bg-success/90 gap-1">
                            <Check className="h-4 w-4" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleCancel(req)} className="gap-1">
                            <X className="h-4 w-4" /> Cancel
                          </Button>
                        </>
                      )}
                      {canDeliver && req.status === 'Approved' && (
                        <Button size="sm" onClick={() => handleDeliver(req)} className="bg-info text-info-foreground hover:bg-info/90 gap-1">
                          <Truck className="h-4 w-4" /> Deliver
                        </Button>
                      )}
                      {(req.status === 'Approved' || req.status === 'Delivered') && (
                        <Button size="sm" variant="outline" onClick={() => handlePDF(req)} className="gap-1">
                          <FileDown className="h-4 w-4" /> PDF
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

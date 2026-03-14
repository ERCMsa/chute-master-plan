import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getChutes, saveChutes, addCustomSize, getCustomSizes } from '@/lib/store';
import { Chute, STEEL_TYPES, SECTION_SIZES } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, Plus } from 'lucide-react';
import type { SteelType } from '@/types';
import ExcelImport from '@/components/ExcelImport';
import { addNotification } from '@/lib/notifications';

export default function AddChutePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [steelType, setSteelType] = useState<SteelType>('IPE');
  const [sectionSize, setSectionSize] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [length, setLength] = useState('');
  const [rack, setRack] = useState('1');
  const [level, setLevel] = useState('1');

  const customSizes = getCustomSizes();
  const allSizes = [
    ...SECTION_SIZES[steelType],
    ...(customSizes[steelType] || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const handleAddCustomSize = () => {
    if (!customSize.trim()) return;
    addCustomSize(steelType, customSize.trim());
    setSectionSize(customSize.trim());
    setCustomSize('');
    setShowCustomSize(false);
    toast.success(`Size ${customSize.trim()} added to ${steelType}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionSize || !length) { toast.error('Fill all fields'); return; }
    const chutes = getChutes();
    const id = `CH-${(chutes.length + 1).toString().padStart(3, '0')}`;
    const newChute: Chute = {
      id,
      steelType,
      sectionSize,
      length: parseInt(length),
      rack: parseInt(rack),
      level: parseInt(level),
      locationCode: `R${rack}-L${level}`,
      dateAdded: new Date().toISOString().split('T')[0],
      addedBy: user?.fullName || '',
      status: 'Available',
    };
    chutes.push(newChute);
    saveChutes(chutes);
    addNotification({
      type: 'chute_added',
      title: 'New Chute Added',
      message: `${steelType} ${sectionSize} - ${length}mm added by ${user?.fullName}`,
      forRoles: ['store_manager', 'production_manager', 'unit1_manager', 'unit2_manager'],
    });
    toast.success(`Chute ${id} added successfully`);
    navigate('/inventory');
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Add New Chute</h2>
        <ExcelImport />
      </div>
      <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <Label>Steel Type</Label>
            <Select value={steelType} onValueChange={v => { setSteelType(v as SteelType); setSectionSize(''); }}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STEEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Section Size</Label>
            {showCustomSize ? (
              <div className="flex gap-2">
                <Input
                  value={customSize}
                  onChange={e => setCustomSize(e.target.value)}
                  placeholder="e.g. 350 or 110x110"
                  className="h-12 flex-1"
                />
                <Button type="button" onClick={handleAddCustomSize} size="icon" className="h-12 w-12 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowCustomSize(false)} className="h-12">
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={sectionSize} onValueChange={setSectionSize}>
                  <SelectTrigger className="h-12 flex-1"><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    {allSizes.map(s => <SelectItem key={s} value={s}>{steelType} {s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setShowCustomSize(true)} className="h-12 w-12 shrink-0" title="Add custom size">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div>
            <Label>Length (mm)</Label>
            <Input type="number" min={1} max={12000} value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 850" className="h-12" />
          </div>
          <div>
            <Label>Rack Number</Label>
            <Input type="number" min={1} max={20} value={rack} onChange={e => setRack(e.target.value)} className="h-12" />
          </div>
          <div>
            <Label>Level</Label>
            <Input type="number" min={1} max={5} value={level} onChange={e => setLevel(e.target.value)} className="h-12" />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Storage: <span className="font-bold text-foreground">Unit 2 — Rack {rack}, Level {level}</span></p>
        </div>

        <Button type="submit" className="btn-industrial red-gradient gap-2 w-full sm:w-auto">
          <PlusCircle className="h-5 w-5" />
          Add Chute
        </Button>
      </form>
    </div>
  );
}

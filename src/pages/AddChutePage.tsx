import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getChutes, saveChutes } from '@/lib/store';
import { Chute, STEEL_TYPES, SECTION_SIZES, ZONES } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import type { SteelType } from '@/types';

export default function AddChutePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [steelType, setSteelType] = useState<SteelType>('IPE');
  const [sectionSize, setSectionSize] = useState('');
  const [length, setLength] = useState('');
  const [zone, setZone] = useState('A');
  const [rack, setRack] = useState('1');
  const [level, setLevel] = useState('1');

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
      zone,
      rack: parseInt(rack),
      level: parseInt(level),
      locationCode: `${zone}-${rack}-${level}`,
      dateAdded: new Date().toISOString().split('T')[0],
      addedBy: user?.fullName || '',
      status: 'Available',
    };
    chutes.push(newChute);
    saveChutes(chutes);
    toast.success(`Chute ${id} added successfully`);
    navigate('/inventory');
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground mb-6">Add New Chute</h2>
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
            <Select value={sectionSize} onValueChange={setSectionSize}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>
                {SECTION_SIZES[steelType].map(s => <SelectItem key={s} value={s}>{steelType} {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Length (mm)</Label>
            <Input type="number" min={1} max={12000} value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 850" className="h-12" />
          </div>
          <div>
            <Label>Zone</Label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ZONES.map(z => <SelectItem key={z} value={z}>Zone {z}</SelectItem>)}
              </SelectContent>
            </Select>
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
          <p className="text-sm text-muted-foreground">Location Code: <span className="font-bold text-foreground">{zone}-{rack}-{level}</span></p>
        </div>

        <Button type="submit" className="btn-industrial red-gradient gap-2 w-full sm:w-auto">
          <PlusCircle className="h-5 w-5" />
          Add Chute
        </Button>
      </form>
    </div>
  );
}

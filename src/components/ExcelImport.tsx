import { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { getChutes, saveChutes } from '@/lib/store';
import { addNotification } from '@/lib/notifications';
import { Chute, SteelType, STEEL_TYPES } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ExcelRow {
  steelType?: string;
  SteelType?: string;
  steel_type?: string;
  Type?: string;
  type?: string;
  sectionSize?: string;
  SectionSize?: string;
  section_size?: string;
  Section?: string;
  section?: string;
  length?: number;
  Length?: number;
  rack?: number;
  Rack?: number;
  level?: number;
  Level?: number;
}

function normalizeRow(row: any): { steelType: string; sectionSize: string; length: number; zone: string; rack: number; level: number } | null {
  const steelType = row.steelType || row.SteelType || row.steel_type || row.Type || row.type || row['Steel Type'] || '';
  const sectionSize = String(row.sectionSize || row.SectionSize || row.section_size || row.Section || row.section || row['Section Size'] || '');
  const length = Number(row.length || row.Length || row['Length (mm)'] || 0);
  const zone = String(row.zone || row.Zone || 'A');
  const rack = Number(row.rack || row.Rack || 1);
  const level = Number(row.level || row.Level || 1);

  if (!steelType || !sectionSize || !length) return null;

  const normalizedType = STEEL_TYPES.find(t => t.toLowerCase() === steelType.toString().toLowerCase());
  if (!normalizedType) return null;

  return { steelType: normalizedType, sectionSize, length, zone: zone.toUpperCase(), rack, level };
}

export default function ExcelImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);

      if (rows.length === 0) {
        toast.error('The Excel file is empty');
        return;
      }

      const chutes = getChutes();
      let nextId = chutes.length + 1;
      let added = 0;
      let skipped = 0;

      for (const row of rows) {
        const normalized = normalizeRow(row);
        if (!normalized) { skipped++; continue; }

        const id = `CH-${nextId.toString().padStart(3, '0')}`;
        const newChute: Chute = {
          id,
          steelType: normalized.steelType as SteelType,
          sectionSize: normalized.sectionSize,
          length: normalized.length,
          rack: normalized.rack,
          level: normalized.level,
          locationCode: `R${normalized.rack}-L${normalized.level}`,
          dateAdded: new Date().toISOString().split('T')[0],
          addedBy: user?.fullName || '',
          status: 'Available',
        };
        chutes.push(newChute);
        nextId++;
        added++;
      }

      saveChutes(chutes);

      addNotification({
        type: 'excel_import',
        title: 'Excel Import Completed',
        message: `${added} chutes imported, ${skipped} rows skipped`,
        forRoles: ['store_manager', 'production_manager'],
      });

      toast.success(`Imported ${added} chutes${skipped > 0 ? `, ${skipped} rows skipped` : ''}`);
    } catch (err) {
      toast.error('Failed to read Excel file');
    }

    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => fileRef.current?.click()}
      >
        <FileSpreadsheet className="h-5 w-5" />
        Import from Excel
      </Button>
    </>
  );
}

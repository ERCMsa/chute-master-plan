import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockItem {
  id: string;
  item_name: string;
  item_type: string;
  length: number | null;
  width: number | null;
  thickness: number | null;
  quantity: number;
  min_quantity: number;
  created_at: string;
  updated_at: string;
}

export function useStock() {
  return useQuery({
    queryKey: ['stock'],
    queryFn: async () => {
      const { data, error } = await supabase.from('stock').select('*').order('item_name');
      if (error) throw error;
      return data as StockItem[];
    },
  });
}

export function useAddStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<StockItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('stock').insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock'] }),
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StockItem> & { id: string }) => {
      const { error } = await supabase.from('stock').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock'] }),
  });
}

export function useDeleteStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stock').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock'] }),
  });
}

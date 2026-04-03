import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DemandList {
  id: string;
  created_by: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  validated_by: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string } | null;
}

export interface DemandListItem {
  id: string;
  demand_list_id: string;
  stock_id: string;
  requested_quantity: number;
  created_at: string;
  stock?: { item_name: string; item_type: string; length: number; width: number; thickness: number; quantity: number } | null;
}

export interface SupplyList {
  id: string;
  created_by: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  validated_by: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string } | null;
}

export interface SupplyListItem {
  id: string;
  supply_list_id: string;
  stock_id: string;
  supplied_quantity: number;
  created_at: string;
  stock?: { item_name: string; item_type: string; length: number; width: number; thickness: number; quantity: number } | null;
}

// Demand Lists
export function useDemandLists() {
  return useQuery({
    queryKey: ['demand_lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demand_lists')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Fetch profile names separately
      const userIds = [...new Set((data || []).map(d => d.created_by))];
      const { data: profiles } = await supabase.from('profiles').select('id, display_name').in('id', userIds);
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p.display_name]));
      return (data || []).map(d => ({ ...d, profiles: { display_name: profileMap[d.created_by] || '' } })) as DemandList[];
    },
  });
}

export function useDemandListItems(listId: string | null) {
  return useQuery({
    queryKey: ['demand_list_items', listId],
    enabled: !!listId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demand_list_items')
        .select('*, stock:stock_id(item_name, item_type, length, width, thickness, quantity)')
        .eq('demand_list_id', listId!);
      if (error) throw error;
      return data as DemandListItem[];
    },
  });
}

export function useCreateDemandList() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (items: { stock_id: string; requested_quantity: number }[]) => {
      // Create the list
      const { data: list, error: listErr } = await supabase
        .from('demand_lists')
        .insert({ created_by: user!.id, notes: '' })
        .select()
        .single();
      if (listErr) throw listErr;

      // Add items
      const itemsToInsert = items.map(i => ({ demand_list_id: list.id, ...i }));
      const { error: itemsErr } = await supabase.from('demand_list_items').insert(itemsToInsert);
      if (itemsErr) throw itemsErr;

      return list;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['demand_lists'] });
    },
  });
}

// Supply Lists
export function useSupplyLists() {
  return useQuery({
    queryKey: ['supply_lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supply_lists')
        .select('*, profiles:created_by(display_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SupplyList[];
    },
  });
}

export function useSupplyListItems(listId: string | null) {
  return useQuery({
    queryKey: ['supply_list_items', listId],
    enabled: !!listId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supply_list_items')
        .select('*, stock:stock_id(item_name, item_type, length, width, thickness, quantity)')
        .eq('supply_list_id', listId!);
      if (error) throw error;
      return data as SupplyListItem[];
    },
  });
}

export function useCreateSupplyList() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (items: { stock_id: string; supplied_quantity: number }[]) => {
      const { data: list, error: listErr } = await supabase
        .from('supply_lists')
        .insert({ created_by: user!.id, notes: '' })
        .select()
        .single();
      if (listErr) throw listErr;

      const itemsToInsert = items.map(i => ({ supply_list_id: list.id, ...i }));
      const { error: itemsErr } = await supabase.from('supply_list_items').insert(itemsToInsert);
      if (itemsErr) throw itemsErr;

      return list;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supply_lists'] });
    },
  });
}

// Validate (approve/reject)
export function useValidateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, id, action }: { type: 'demand' | 'supply'; id: string; action: 'approved' | 'rejected' }) => {
      const table = type === 'demand' ? 'demand_lists' : 'supply_lists';
      const { error } = await supabase.from(table).update({ status: action }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['demand_lists'] });
      qc.invalidateQueries({ queryKey: ['supply_lists'] });
      qc.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}

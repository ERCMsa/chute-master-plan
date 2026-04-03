
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('engineer', 'magazinier', 'stock_manager');

-- Create list status enum
CREATE TYPE public.list_status AS ENUM ('pending', 'approved', 'rejected');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  role app_role NOT NULL DEFAULT 'engineer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Stock table
CREATE TABLE public.stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT '',
  length NUMERIC,
  width NUMERIC,
  thickness NUMERIC,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;

-- Demand lists (engineer requests)
CREATE TABLE public.demand_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status list_status NOT NULL DEFAULT 'pending',
  notes TEXT DEFAULT '',
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.demand_lists ENABLE ROW LEVEL SECURITY;

-- Demand list items
CREATE TABLE public.demand_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_list_id UUID NOT NULL REFERENCES public.demand_lists(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES public.stock(id) ON DELETE CASCADE,
  requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.demand_list_items ENABLE ROW LEVEL SECURITY;

-- Supply lists (magazinier additions)
CREATE TABLE public.supply_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status list_status NOT NULL DEFAULT 'pending',
  notes TEXT DEFAULT '',
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.supply_lists ENABLE ROW LEVEL SECURITY;

-- Supply list items
CREATE TABLE public.supply_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_list_id UUID NOT NULL REFERENCES public.supply_lists(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES public.stock(id) ON DELETE CASCADE,
  supplied_quantity INTEGER NOT NULL CHECK (supplied_quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.supply_list_items ENABLE ROW LEVEL SECURITY;

-- Audit log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Helper: check role
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'engineer')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_stock_updated_at BEFORE UPDATE ON public.stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_demand_lists_updated_at BEFORE UPDATE ON public.demand_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_supply_lists_updated_at BEFORE UPDATE ON public.supply_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Stock update function on demand list approval
CREATE OR REPLACE FUNCTION public.handle_demand_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Check all items have sufficient stock
    IF EXISTS (
      SELECT 1 FROM public.demand_list_items dli
      JOIN public.stock s ON s.id = dli.stock_id
      WHERE dli.demand_list_id = NEW.id
      AND s.quantity < dli.requested_quantity
    ) THEN
      RAISE EXCEPTION 'Insufficient stock for one or more items';
    END IF;
    
    -- Subtract quantities
    UPDATE public.stock s
    SET quantity = s.quantity - dli.requested_quantity
    FROM public.demand_list_items dli
    WHERE dli.demand_list_id = NEW.id AND s.id = dli.stock_id;
    
    -- Set validator info
    NEW.validated_by = auth.uid();
    NEW.validated_at = now();
    
    -- Audit log
    INSERT INTO public.audit_log (user_id, action, details)
    VALUES (auth.uid(), 'demand_approved', jsonb_build_object('demand_list_id', NEW.id));
  END IF;
  
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    NEW.validated_by = auth.uid();
    NEW.validated_at = now();
    INSERT INTO public.audit_log (user_id, action, details)
    VALUES (auth.uid(), 'demand_rejected', jsonb_build_object('demand_list_id', NEW.id));
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_demand_list_status_change
  BEFORE UPDATE OF status ON public.demand_lists
  FOR EACH ROW EXECUTE FUNCTION public.handle_demand_approval();

-- Stock update function on supply list approval
CREATE OR REPLACE FUNCTION public.handle_supply_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Add quantities
    UPDATE public.stock s
    SET quantity = s.quantity + sli.supplied_quantity
    FROM public.supply_list_items sli
    WHERE sli.supply_list_id = NEW.id AND s.id = sli.stock_id;
    
    NEW.validated_by = auth.uid();
    NEW.validated_at = now();
    
    INSERT INTO public.audit_log (user_id, action, details)
    VALUES (auth.uid(), 'supply_approved', jsonb_build_object('supply_list_id', NEW.id));
  END IF;
  
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    NEW.validated_by = auth.uid();
    NEW.validated_at = now();
    INSERT INTO public.audit_log (user_id, action, details)
    VALUES (auth.uid(), 'supply_rejected', jsonb_build_object('supply_list_id', NEW.id));
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_supply_list_status_change
  BEFORE UPDATE OF status ON public.supply_lists
  FOR EACH ROW EXECUTE FUNCTION public.handle_supply_approval();

-- RLS Policies

-- Profiles: everyone can read, users can update own display_name, stock_manager can update roles
CREATE POLICY "Anyone authenticated can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Stock: all can read, stock_manager can CUD
CREATE POLICY "All authenticated can read stock" ON public.stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Stock manager can insert stock" ON public.stock FOR INSERT TO authenticated WITH CHECK (public.has_role('stock_manager'));
CREATE POLICY "Stock manager can update stock" ON public.stock FOR UPDATE TO authenticated USING (public.has_role('stock_manager'));
CREATE POLICY "Stock manager can delete stock" ON public.stock FOR DELETE TO authenticated USING (public.has_role('stock_manager'));

-- Demand lists: engineers see own, stock_manager sees all
CREATE POLICY "Engineers see own demand lists" ON public.demand_lists FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role('stock_manager'));
CREATE POLICY "Engineers can create demand lists" ON public.demand_lists FOR INSERT TO authenticated
  WITH CHECK (public.has_role('engineer') AND created_by = auth.uid());
CREATE POLICY "Engineers can update own pending, SM can update status" ON public.demand_lists FOR UPDATE TO authenticated
  USING (
    (public.has_role('engineer') AND created_by = auth.uid() AND status = 'pending')
    OR public.has_role('stock_manager')
  );
CREATE POLICY "Engineers can delete own pending" ON public.demand_lists FOR DELETE TO authenticated
  USING (public.has_role('engineer') AND created_by = auth.uid() AND status = 'pending');

-- Demand list items
CREATE POLICY "See demand list items" ON public.demand_list_items FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.demand_lists dl WHERE dl.id = demand_list_id AND (dl.created_by = auth.uid() OR public.has_role('stock_manager')))
  );
CREATE POLICY "Engineers can insert demand items" ON public.demand_list_items FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role('engineer') AND
    EXISTS (SELECT 1 FROM public.demand_lists dl WHERE dl.id = demand_list_id AND dl.created_by = auth.uid() AND dl.status = 'pending')
  );
CREATE POLICY "Engineers can update own pending demand items" ON public.demand_list_items FOR UPDATE TO authenticated
  USING (
    public.has_role('engineer') AND
    EXISTS (SELECT 1 FROM public.demand_lists dl WHERE dl.id = demand_list_id AND dl.created_by = auth.uid() AND dl.status = 'pending')
  );
CREATE POLICY "Engineers can delete own pending demand items" ON public.demand_list_items FOR DELETE TO authenticated
  USING (
    public.has_role('engineer') AND
    EXISTS (SELECT 1 FROM public.demand_lists dl WHERE dl.id = demand_list_id AND dl.created_by = auth.uid() AND dl.status = 'pending')
  );

-- Supply lists: magaziniers see own, stock_manager sees all
CREATE POLICY "Magaziniers see own supply lists" ON public.supply_lists FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.has_role('stock_manager'));
CREATE POLICY "Magaziniers can create supply lists" ON public.supply_lists FOR INSERT TO authenticated
  WITH CHECK (public.has_role('magazinier') AND created_by = auth.uid());
CREATE POLICY "Magaziniers can update own pending, SM can update status" ON public.supply_lists FOR UPDATE TO authenticated
  USING (
    (public.has_role('magazinier') AND created_by = auth.uid() AND status = 'pending')
    OR public.has_role('stock_manager')
  );
CREATE POLICY "Magaziniers can delete own pending" ON public.supply_lists FOR DELETE TO authenticated
  USING (public.has_role('magazinier') AND created_by = auth.uid() AND status = 'pending');

-- Supply list items
CREATE POLICY "See supply list items" ON public.supply_list_items FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.supply_lists sl WHERE sl.id = supply_list_id AND (sl.created_by = auth.uid() OR public.has_role('stock_manager')))
  );
CREATE POLICY "Magaziniers can insert supply items" ON public.supply_list_items FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role('magazinier') AND
    EXISTS (SELECT 1 FROM public.supply_lists sl WHERE sl.id = supply_list_id AND sl.created_by = auth.uid() AND sl.status = 'pending')
  );
CREATE POLICY "Magaziniers can update own pending supply items" ON public.supply_list_items FOR UPDATE TO authenticated
  USING (
    public.has_role('magazinier') AND
    EXISTS (SELECT 1 FROM public.supply_lists sl WHERE sl.id = supply_list_id AND sl.created_by = auth.uid() AND sl.status = 'pending')
  );
CREATE POLICY "Magaziniers can delete own pending supply items" ON public.supply_list_items FOR DELETE TO authenticated
  USING (
    public.has_role('magazinier') AND
    EXISTS (SELECT 1 FROM public.supply_lists sl WHERE sl.id = supply_list_id AND sl.created_by = auth.uid() AND sl.status = 'pending')
  );

-- Audit log: stock_manager can read, no direct writes
CREATE POLICY "Stock manager can read audit log" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role('stock_manager'));

-- Enable realtime for stock
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock;
ALTER PUBLICATION supabase_realtime ADD TABLE public.demand_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.supply_lists;

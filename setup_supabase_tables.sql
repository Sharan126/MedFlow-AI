-- ============================================================
-- SQL Script for your 4 Supabase Tables
-- Run this in Supabase: Dashboard -> SQL Editor -> New Query -> Paste & Run
-- (Uses ADD COLUMN IF NOT EXISTS so it updates your existing 4 tables safely!)
-- ============================================================

-- 1. HOSPITALS TABLE COLUMNS
ALTER TABLE IF EXISTS public.hospitals 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Dakshina Kannada',
ADD COLUMN IF NOT EXISTS taluk TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS hfr_id TEXT UNIQUE;

-- 2. MEDICINES TABLE COLUMNS
ALTER TABLE IF EXISTS public.medicines 
ADD COLUMN IF NOT EXISTS name TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. INVENTORY TABLE COLUMNS
ALTER TABLE IF EXISTS public.inventory 
ADD COLUMN IF NOT EXISTS hospital_name TEXT,
ADD COLUMN IF NOT EXISTS medicine_name TEXT,
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS threshold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. TRADE HISTORY TABLE COLUMNS
ALTER TABLE IF EXISTS public.trade_history 
ADD COLUMN IF NOT EXISTS donor TEXT,
ADD COLUMN IF NOT EXISTS receiver TEXT,
ADD COLUMN IF NOT EXISTS medicines JSONB,
ADD COLUMN IF NOT EXISTS counter_medicines JSONB,
ADD COLUMN IF NOT EXISTS explanation TEXT,
ADD COLUMN IF NOT EXISTS status TEXT,
ADD COLUMN IF NOT EXISTS timestamp TEXT;

-- 5. ENABLE ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Read policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow read on hospitals') THEN
        CREATE POLICY "Allow read on hospitals" ON public.hospitals FOR SELECT TO public USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow read on medicines') THEN
        CREATE POLICY "Allow read on medicines" ON public.medicines FOR SELECT TO public USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow read on inventory') THEN
        CREATE POLICY "Allow read on inventory" ON public.inventory FOR SELECT TO public USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow read on trade_history') THEN
        CREATE POLICY "Allow read on trade_history" ON public.trade_history FOR SELECT TO public USING (true);
    END IF;

    -- Service write policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service write on hospitals') THEN
        CREATE POLICY "Allow service write on hospitals" ON public.hospitals FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service write on medicines') THEN
        CREATE POLICY "Allow service write on medicines" ON public.medicines FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service write on inventory') THEN
        CREATE POLICY "Allow service write on inventory" ON public.inventory FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service write on trade_history') THEN
        CREATE POLICY "Allow service write on trade_history" ON public.trade_history FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

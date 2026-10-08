-- ============================================================
-- Supabase Schema for Dakshina Kannada Hospital Network
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Create the hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT 'Dakshina Kannada',
    taluk TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Government', 'Private')),
    hfr_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create useful indexes for spatial and search performance
CREATE INDEX IF NOT EXISTS idx_hospitals_taluk ON public.hospitals (taluk);
CREATE INDEX IF NOT EXISTS idx_hospitals_type ON public.hospitals (type);
CREATE INDEX IF NOT EXISTS idx_hospitals_coords ON public.hospitals (latitude, longitude);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- 4. Allow public read access (essential for frontend display)
CREATE POLICY "Allow public read access on hospitals"
ON public.hospitals
FOR SELECT
TO public
USING (true);

-- 5. Allow authenticated or service role write access
CREATE POLICY "Allow service role write access on hospitals"
ON public.hospitals
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

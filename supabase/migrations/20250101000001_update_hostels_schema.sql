-- Update hostels table schema for new requirements

-- First, create the new hostels table structure
CREATE TABLE IF NOT EXISTS public.hostels_new (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    location text NOT NULL,
    university text NOT NULL,
    male_rooms integer NOT NULL DEFAULT 0,
    female_rooms integer NOT NULL DEFAULT 0,
    beds_per_room integer NOT NULL DEFAULT 1,
    price_per_bed numeric NOT NULL,
    duration_type text NOT NULL CHECK (duration_type IN ('semester', 'year')),
    facilities text[] DEFAULT '{}',
    description text,
    images text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Create price_alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    university text NOT NULL,
    max_price numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hostels_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for hostels_new
CREATE POLICY "Anyone can view active hostels" ON public.hostels_new
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create hostels" ON public.hostels_new
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own hostels" ON public.hostels_new
    FOR UPDATE USING (auth.uid() = created_by);

-- Create policies for price_alerts
CREATE POLICY "Users can view their own price alerts" ON public.price_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price alerts" ON public.price_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts" ON public.price_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts" ON public.price_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hostels_new_university ON public.hostels_new(university);
CREATE INDEX IF NOT EXISTS idx_hostels_new_location ON public.hostels_new(location);
CREATE INDEX IF NOT EXISTS idx_hostels_new_price ON public.hostels_new(price_per_bed);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_university ON public.price_alerts(university);

-- Create advanced hostels and rooms schema

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.hostels CASCADE;

-- Create hostels table with location coordinates
CREATE TABLE public.hostels (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    location text NOT NULL,
    latitude float,
    longitude float,
    university text NOT NULL,
    walk_minutes integer,
    drive_minutes integer,
    description text,
    images text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Create rooms table for different room types
CREATE TABLE public.rooms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hostel_id uuid REFERENCES public.hostels(id) ON DELETE CASCADE NOT NULL,
    gender text NOT NULL CHECK (gender IN ('male', 'female', 'mixed')),
    capacity integer NOT NULL CHECK (capacity > 0),
    room_count integer NOT NULL CHECK (room_count > 0),
    price_per_bed numeric NOT NULL CHECK (price_per_bed > 0),
    amenities text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- Update price_alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.price_alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    university text NOT NULL,
    max_price numeric NOT NULL CHECK (max_price > 0),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hostels
CREATE POLICY "Anyone can view hostels" ON public.hostels
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create hostels" ON public.hostels
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own hostels" ON public.hostels
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own hostels" ON public.hostels
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for rooms
CREATE POLICY "Anyone can view rooms" ON public.rooms
    FOR SELECT USING (true);

CREATE POLICY "Users can manage rooms for their hostels" ON public.rooms
    FOR ALL USING (
        hostel_id IN (
            SELECT id FROM public.hostels WHERE created_by = auth.uid()
        )
    );

-- RLS Policies for price_alerts
CREATE POLICY "Users can view their own price alerts" ON public.price_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price alerts" ON public.price_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts" ON public.price_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts" ON public.price_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_hostels_university ON public.hostels(university);
CREATE INDEX idx_hostels_location ON public.hostels(location);
CREATE INDEX idx_hostels_coordinates ON public.hostels(latitude, longitude);
CREATE INDEX idx_hostels_created_by ON public.hostels(created_by);

CREATE INDEX idx_rooms_hostel_id ON public.rooms(hostel_id);
CREATE INDEX idx_rooms_gender ON public.rooms(gender);
CREATE INDEX idx_rooms_capacity ON public.rooms(capacity);
CREATE INDEX idx_rooms_price ON public.rooms(price_per_bed);

CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_university ON public.price_alerts(university);
CREATE INDEX idx_price_alerts_price ON public.price_alerts(max_price);

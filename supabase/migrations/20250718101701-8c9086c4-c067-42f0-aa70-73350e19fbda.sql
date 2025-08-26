
-- Create enums for hostel-related data
CREATE TYPE public.hostel_type AS ENUM ('male', 'female', 'mixed');
CREATE TYPE public.room_type AS ENUM ('single', 'double', 'triple', 'quad', 'dormitory');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'partial', 'completed', 'failed', 'refunded');

-- Create hostels table
CREATE TABLE public.hostels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  hostel_type hostel_type NOT NULL,
  total_rooms INTEGER NOT NULL DEFAULT 0,
  available_rooms INTEGER NOT NULL DEFAULT 0,
  amenities TEXT[], -- Array of amenities like ['wifi', 'laundry', 'security', 'parking']
  images TEXT[], -- Array of image URLs
  price_per_semester DECIMAL(10, 2) NOT NULL,
  price_per_academic_year DECIMAL(10, 2),
  security_deposit DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  room_type room_type NOT NULL,
  capacity INTEGER NOT NULL,
  occupied INTEGER DEFAULT 0,
  price_per_semester DECIMAL(10, 2) NOT NULL,
  price_per_academic_year DECIMAL(10, 2),
  amenities TEXT[],
  images TEXT[],
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hostel_id, room_number)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  booking_status booking_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  hold_expires_at TIMESTAMP WITH TIME ZONE,
  semester TEXT NOT NULL, -- e.g., 'Fall 2024', 'Spring 2025'
  academic_year TEXT NOT NULL, -- e.g., '2024/2025'
  total_amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0.0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, hostel_id) -- One review per student per hostel
);

-- Enable RLS on all tables
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hostels
CREATE POLICY "Everyone can view active verified hostels" 
ON public.hostels 
FOR SELECT 
USING (is_active = true AND is_verified = true);

CREATE POLICY "Landlords can view their own hostels" 
ON public.hostels 
FOR SELECT 
USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert their own hostels" 
ON public.hostels 
FOR INSERT 
WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update their own hostels" 
ON public.hostels 
FOR UPDATE 
USING (auth.uid() = landlord_id);

-- RLS Policies for rooms
CREATE POLICY "Everyone can view rooms of active hostels" 
ON public.rooms 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.hostels 
  WHERE hostels.id = rooms.hostel_id 
  AND hostels.is_active = true 
  AND hostels.is_verified = true
));

CREATE POLICY "Landlords can manage rooms of their hostels" 
ON public.rooms 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.hostels 
  WHERE hostels.id = rooms.hostel_id 
  AND hostels.landlord_id = auth.uid()
));

-- RLS Policies for bookings
CREATE POLICY "Students can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Landlords can view bookings for their hostels" 
ON public.bookings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.hostels 
  WHERE hostels.id = bookings.hostel_id 
  AND hostels.landlord_id = auth.uid()
));

CREATE POLICY "Students can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = student_id);

-- RLS Policies for reviews
CREATE POLICY "Everyone can view reviews" 
ON public.reviews 
FOR SELECT 
TO PUBLIC;

CREATE POLICY "Students can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = student_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hostels_updated_at
BEFORE UPDATE ON public.hostels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update hostel rating when reviews change
CREATE OR REPLACE FUNCTION public.update_hostel_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.hostels
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0.0)
      FROM public.reviews
      WHERE hostel_id = COALESCE(NEW.hostel_id, OLD.hostel_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE hostel_id = COALESCE(NEW.hostel_id, OLD.hostel_id)
    )
  WHERE id = COALESCE(NEW.hostel_id, OLD.hostel_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for rating updates
CREATE TRIGGER update_hostel_rating_on_review_insert
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_hostel_rating();

CREATE TRIGGER update_hostel_rating_on_review_update
AFTER UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_hostel_rating();

CREATE TRIGGER update_hostel_rating_on_review_delete
AFTER DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_hostel_rating();

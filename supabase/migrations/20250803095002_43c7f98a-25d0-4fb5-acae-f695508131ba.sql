-- Enhanced Reviews & Rating System

-- Add photo support and enhanced features to reviews table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS photos TEXT[];
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS landlord_response TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS landlord_response_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS stay_duration TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS room_cleanliness_rating INTEGER;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS security_rating INTEGER;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS value_for_money_rating INTEGER;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS location_rating INTEGER;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS facilities_rating INTEGER;

-- Create review_helpfulness table for tracking helpful votes
CREATE TABLE IF NOT EXISTS public.review_helpfulness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS on review_helpfulness
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;

-- Create policies for review_helpfulness
CREATE POLICY "Users can vote on review helpfulness" 
ON public.review_helpfulness 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view helpfulness votes" 
ON public.review_helpfulness 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their helpfulness votes" 
ON public.review_helpfulness 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create storage bucket for review photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for review photos
CREATE POLICY "Review photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'review-photos');

CREATE POLICY "Authenticated users can upload review photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'review-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own review photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own review photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add policy for landlords to respond to reviews
CREATE POLICY "Landlords can update reviews for their hostels" 
ON public.reviews 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.hostels 
    WHERE hostels.id = reviews.hostel_id 
    AND hostels.landlord_id = auth.uid()
  )
);

-- Function to verify reviews for completed bookings
CREATE OR REPLACE FUNCTION public.verify_review_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow reviews for confirmed bookings that have ended
  IF NOT EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = NEW.booking_id 
    AND student_id = auth.uid()
    AND booking_status = 'confirmed'
    AND created_at < now() - interval '1 day'
  ) THEN
    RAISE EXCEPTION 'You can only review hostels after completing a confirmed booking';
  END IF;
  
  -- Set verified status
  NEW.is_verified := true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for review verification
CREATE TRIGGER verify_review_before_insert
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.verify_review_eligibility();

-- Function to update helpful count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.reviews 
  SET helpful_count = (
    SELECT COUNT(*) 
    FROM public.review_helpfulness 
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
    AND is_helpful = true
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for helpful count updates
CREATE TRIGGER update_helpful_count_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON public.review_helpfulness
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_helpful_count();
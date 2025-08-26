-- Fix security warnings by setting proper search paths for functions

-- Fix verify_review_eligibility function
CREATE OR REPLACE FUNCTION public.verify_review_eligibility()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
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
$$;

-- Fix update_review_helpful_count function
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
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
$$;
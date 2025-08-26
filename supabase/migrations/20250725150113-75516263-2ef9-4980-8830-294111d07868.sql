-- Fix security warnings by setting search_path for all functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, user_type, full_name, phone_number, institution, student_id, program, business_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::public.user_type, 'student'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'phone_number',
    COALESCE((NEW.raw_user_meta_data ->> 'institution')::public.institution, 'other'),
    NEW.raw_user_meta_data ->> 'student_id',
    NEW.raw_user_meta_data ->> 'program',
    NEW.raw_user_meta_data ->> 'business_name'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
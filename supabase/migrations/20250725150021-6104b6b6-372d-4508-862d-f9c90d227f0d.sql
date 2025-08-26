-- First, ensure all required types exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE public.user_type AS ENUM ('student', 'landlord', 'admin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'institution') THEN
        CREATE TYPE public.institution AS ENUM (
          'university_of_ghana',
          'kwame_nkrumah_university',
          'university_of_cape_coast',
          'ghana_institute_of_management',
          'university_of_professional_studies',
          'central_university',
          'ashesi_university',
          'other'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
    END IF;
END $$;

-- Recreate the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, user_type, full_name, phone_number, institution, student_id, program, business_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::user_type, 'student'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'phone_number',
    COALESCE((NEW.raw_user_meta_data ->> 'institution')::institution, 'other'),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it's properly connected
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
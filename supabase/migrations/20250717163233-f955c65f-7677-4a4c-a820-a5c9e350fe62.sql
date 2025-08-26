-- Create enums for user types and institutions
CREATE TYPE public.user_type AS ENUM ('student', 'landlord', 'admin');

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

CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  institution institution,
  student_id TEXT,
  program TEXT,
  business_name TEXT,
  verification_status verification_status DEFAULT 'pending',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
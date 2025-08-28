-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'landlord', 'admin')) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Add status column to hostels table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostels' AND column_name = 'status') THEN
    ALTER TABLE hostels ADD COLUMN status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending';
  END IF;
END $$;

-- Enable RLS on hostels
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;

-- Hostels policies
CREATE POLICY "Everyone can view approved hostels" ON hostels
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can insert hostels as pending" ON hostels
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (status IS NULL OR status = 'pending')
  );

CREATE POLICY "Users can view their own hostels" ON hostels
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can update their own hostels" ON hostels
  FOR UPDATE USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Admin-only policy for status updates
CREATE POLICY "Admins can update hostel status" ON hostels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin-only policy to view all hostels
CREATE POLICY "Admins can view all hostels" ON hostels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add new features tables

-- Buddy System Tables
CREATE TABLE IF NOT EXISTS buddy_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  institution TEXT NOT NULL,
  program TEXT NOT NULL,
  year TEXT NOT NULL,
  personality TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  study_habits TEXT,
  sleep_schedule TEXT NOT NULL,
  budget TEXT NOT NULL,
  location TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buddy_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Horror Stories Contest Tables
CREATE TABLE IF NOT EXISTS horror_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  hostel_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('funny', 'scary', 'weird', 'gross', 'mysterious')),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS story_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES horror_stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Personality Quiz Results
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  personality_type TEXT NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital Contracts
CREATE TABLE IF NOT EXISTS digital_contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  contract_data JSONB NOT NULL,
  contract_html TEXT NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fraud Detection Alerts
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('suspicious_booking', 'fake_review', 'price_manipulation', 'fake_hostel')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'false_positive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buddy_profiles_user_id ON buddy_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_buddy_profiles_personality ON buddy_profiles(personality);
CREATE INDEX IF NOT EXISTS idx_buddy_profiles_institution ON buddy_profiles(institution);
CREATE INDEX IF NOT EXISTS idx_buddy_requests_from_user ON buddy_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_buddy_requests_to_user ON buddy_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_horror_stories_author ON horror_stories(author_id);
CREATE INDEX IF NOT EXISTS idx_horror_stories_category ON horror_stories(category);
CREATE INDEX IF NOT EXISTS idx_horror_stories_created_at ON horror_stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_votes_story_user ON story_votes(story_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_contracts_booking ON digital_contracts(booking_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_severity ON fraud_alerts(severity);

-- Add RLS policies
ALTER TABLE buddy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE horror_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;

-- Buddy profiles policies
CREATE POLICY "Users can view all buddy profiles" ON buddy_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own buddy profile" ON buddy_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buddy profile" ON buddy_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buddy profile" ON buddy_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Buddy requests policies
CREATE POLICY "Users can view their buddy requests" ON buddy_requests
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create buddy requests" ON buddy_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their buddy requests" ON buddy_requests
  FOR UPDATE USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Horror stories policies
CREATE POLICY "Users can view all horror stories" ON horror_stories
  FOR SELECT USING (true);

CREATE POLICY "Users can create horror stories" ON horror_stories
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own horror stories" ON horror_stories
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own horror stories" ON horror_stories
  FOR DELETE USING (auth.uid() = author_id);

-- Story votes policies
CREATE POLICY "Users can view story votes" ON story_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create story votes" ON story_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story votes" ON story_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Quiz results policies
CREATE POLICY "Users can view their own quiz results" ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create quiz results" ON quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Digital contracts policies
CREATE POLICY "Users can view their own contracts" ON digital_contracts
  FOR SELECT USING (auth.uid() = generated_by);

CREATE POLICY "Users can create contracts" ON digital_contracts
  FOR INSERT WITH CHECK (auth.uid() = generated_by);

-- Fraud alerts policies (admin only)
CREATE POLICY "Admins can view fraud alerts" ON fraud_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update fraud alerts" ON fraud_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_buddy_profiles_updated_at 
  BEFORE UPDATE ON buddy_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buddy_requests_updated_at 
  BEFORE UPDATE ON buddy_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horror_stories_updated_at 
  BEFORE UPDATE ON horror_stories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_alerts_updated_at 
  BEFORE UPDATE ON fraud_alerts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

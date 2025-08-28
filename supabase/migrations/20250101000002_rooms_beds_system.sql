-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hostel_id, room_number)
);

-- Create beds table
CREATE TABLE IF NOT EXISTS beds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  bed_number INTEGER NOT NULL CHECK (bed_number > 0),
  occupant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, bed_number)
);

-- Enable RLS on rooms table
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Enable RLS on beds table
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;

-- Rooms policies
CREATE POLICY "Everyone can view approved hostel rooms" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM hostels 
      WHERE hostels.id = rooms.hostel_id 
      AND hostels.status = 'approved'
    )
  );

CREATE POLICY "Landlords can view their own hostel rooms" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM hostels 
      WHERE hostels.id = rooms.hostel_id 
      AND hostels.created_by = auth.uid()
    )
  );

CREATE POLICY "Landlords can insert rooms for their hostels" ON rooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM hostels 
      WHERE hostels.id = rooms.hostel_id 
      AND hostels.created_by = auth.uid()
    )
  );

CREATE POLICY "Landlords can update their own hostel rooms" ON rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM hostels 
      WHERE hostels.id = rooms.hostel_id 
      AND hostels.created_by = auth.uid()
    )
  );

CREATE POLICY "Landlords can delete their own hostel rooms" ON rooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM hostels 
      WHERE hostels.id = rooms.hostel_id 
      AND hostels.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all rooms" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Beds policies
CREATE POLICY "Everyone can view beds in approved hostel rooms" ON beds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.id = beds.room_id 
      AND h.status = 'approved'
    )
  );

CREATE POLICY "Landlords can view beds in their own hostel rooms" ON beds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.id = beds.room_id 
      AND h.created_by = auth.uid()
    )
  );

CREATE POLICY "Landlords can insert beds for their hostel rooms" ON beds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.id = beds.room_id 
      AND h.created_by = auth.uid()
    )
  );

CREATE POLICY "Landlords can update beds in their hostel rooms" ON beds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.id = beds.room_id 
      AND h.created_by = auth.uid()
    )
  );

CREATE POLICY "Landlords can delete beds in their hostel rooms" ON beds
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.id = beds.room_id 
      AND h.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view their own bed assignment" ON beds
  FOR SELECT USING (occupant_id = auth.uid());

CREATE POLICY "Admins can view all beds" ON beds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_hostel_id ON rooms(hostel_id);
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_occupant_id ON beds(occupant_id);

-- Function to automatically create beds when a room is created
CREATE OR REPLACE FUNCTION create_beds_for_room()
RETURNS TRIGGER AS $$
BEGIN
  -- Create beds based on room capacity
  FOR i IN 1..NEW.capacity LOOP
    INSERT INTO beds (room_id, bed_number)
    VALUES (NEW.id, i);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create beds automatically
CREATE TRIGGER create_beds_after_room_insert
  AFTER INSERT ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION create_beds_for_room();

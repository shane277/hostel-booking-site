
-- Insert sample hostels data for testing and development
INSERT INTO public.hostels (
  landlord_id, name, description, address, city, region, hostel_type, 
  total_rooms, available_rooms, amenities, images, price_per_semester, 
  price_per_academic_year, security_deposit, is_active, is_verified, rating, total_reviews
) VALUES 
-- Sample hostel 1
(
  '00000000-0000-0000-0000-000000000001', -- placeholder landlord_id
  'Zion Student Lodge',
  'Modern student accommodation with excellent facilities near UPSA. Clean, secure, and well-maintained rooms with 24/7 security and high-speed internet.',
  'East Legon Road, Near UPSA Main Gate',
  'Accra',
  'Greater Accra',
  'mixed',
  20,
  8,
  ARRAY['WiFi', 'Security', 'Parking', 'Laundry', 'Study Room', 'Kitchen'],
  ARRAY['https://images.unsplash.com/photo-1721322800607-8c38375eef04'],
  2800.00,
  5600.00,
  1000.00,
  true,
  true,
  4.8,
  124
),
-- Sample hostel 2
(
  '00000000-0000-0000-0000-000000000002',
  'Grace Hostel',
  'Affordable and comfortable hostel accommodation for female students. Located in a quiet neighborhood with easy access to University of Ghana.',
  'Adenta Housing Down, Near UG',
  'Accra',
  'Greater Accra',
  'female',
  15,
  12,
  ARRAY['WiFi', 'Kitchen', 'Study Room', 'Security', 'Water'],
  ARRAY['https://images.unsplash.com/photo-1649972904349-6e44c42644a7'],
  2200.00,
  4400.00,
  800.00,
  true,
  true,
  4.6,
  89
),
-- Sample hostel 3
(
  '00000000-0000-0000-0000-000000000003',
  'Royal Student Hub',
  'Premium student accommodation with modern amenities. Features include gym facilities, cafeteria, and spacious study areas.',
  'Achimota Mile 7, Near GIMPA',
  'Accra',
  'Greater Accra',
  'mixed',
  25,
  15,
  ARRAY['WiFi', 'Security', 'Gym', 'Cafeteria', 'Parking', 'Laundry'],
  ARRAY['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'],
  3200.00,
  6400.00,
  1200.00,
  true,
  true,
  4.7,
  156
),
-- Sample hostel 4
(
  '00000000-0000-0000-0000-000000000004',
  'Peace Villa',
  'Budget-friendly accommodation for students seeking quality at affordable prices. Clean rooms with basic amenities.',
  'Madina Estate, Near UG',
  'Accra',
  'Greater Accra',
  'mixed',
  10,
  6,
  ARRAY['WiFi', 'Parking', 'Garden', 'Water'],
  ARRAY['https://images.unsplash.com/photo-1487958449943-2429e8be8625'],
  1800.00,
  3600.00,
  600.00,
  true,
  false,
  4.4,
  67
),
-- Sample hostel 5
(
  '00000000-0000-0000-0000-000000000005',
  'Unity Heights',
  'Male-only hostel with excellent security and study environment. Perfect for serious students who value peace and quiet.',
  'Tema Station, Near UG',
  'Accra',
  'Greater Accra',
  'male',
  18,
  10,
  ARRAY['WiFi', 'Security', 'Study Room', 'Parking'],
  ARRAY['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'],
  2500.00,
  5000.00,
  900.00,
  true,
  true,
  4.5,
  92
),
-- Sample hostel 6
(
  '00000000-0000-0000-0000-000000000006',
  'Golden Gate Hostel',
  'Luxury student accommodation in Kumasi near KNUST. Features modern facilities and excellent connectivity to campus.',
  'KNUST Campus, Near Main Gate',
  'Kumasi',
  'Ashanti',
  'mixed',
  30,
  20,
  ARRAY['WiFi', 'Security', 'Gym', 'Cafeteria', 'Laundry', 'Study Room'],
  ARRAY['https://images.unsplash.com/photo-1649972904349-6e44c42644a7'],
  2900.00,
  5800.00,
  1100.00,
  true,
  true,
  4.9,
  203
);

-- Insert some sample rooms for the hostels
INSERT INTO public.rooms (
  hostel_id, room_number, room_type, capacity, occupied, price_per_semester, 
  price_per_academic_year, amenities, images, is_available
) VALUES 
-- Rooms for Zion Student Lodge
(
  (SELECT id FROM public.hostels WHERE name = 'Zion Student Lodge'),
  'A101', 'double', 2, 0, 2800.00, 5600.00,
  ARRAY['AC', 'Private Bathroom', 'Study Desk'],
  ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7'],
  true
),
(
  (SELECT id FROM public.hostels WHERE name = 'Zion Student Lodge'),
  'A102', 'double', 2, 1, 2800.00, 5600.00,
  ARRAY['AC', 'Private Bathroom', 'Study Desk'],
  ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7'],
  true
),
-- Rooms for Grace Hostel
(
  (SELECT id FROM public.hostels WHERE name = 'Grace Hostel'),
  'B201', 'triple', 3, 2, 2200.00, 4400.00,
  ARRAY['Fan', 'Shared Bathroom', 'Wardrobe'],
  ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7'],
  true
),
-- Rooms for Royal Student Hub
(
  (SELECT id FROM public.hostels WHERE name = 'Royal Student Hub'),
  'C301', 'single', 1, 0, 3200.00, 6400.00,
  ARRAY['AC', 'Private Bathroom', 'Balcony', 'Study Desk'],
  ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7'],
  true
);

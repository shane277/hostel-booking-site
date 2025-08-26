-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.expire_room_holds()
RETURNS void AS $$
BEGIN
  -- Update expired holds to cancelled
  UPDATE public.bookings 
  SET booking_status = 'cancelled'
  WHERE booking_status = 'on_hold' 
    AND hold_expires_at < now();
    
  -- Update room availability when holds expire
  UPDATE public.rooms 
  SET is_available = true
  WHERE id IN (
    SELECT DISTINCT room_id 
    FROM public.bookings 
    WHERE booking_status = 'cancelled' 
      AND hold_expires_at < now()
      AND updated_at > now() - interval '1 minute'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Fix function search path for check_room_availability
CREATE OR REPLACE FUNCTION public.check_room_availability(room_uuid uuid)
RETURNS boolean AS $$
DECLARE
  room_available boolean;
  active_bookings_count integer;
  room_capacity integer;
BEGIN
  -- Get room capacity and current availability
  SELECT capacity, is_available 
  INTO room_capacity, room_available
  FROM public.rooms 
  WHERE id = room_uuid;
  
  -- Count active bookings (confirmed, pending, or on_hold)
  SELECT COUNT(*)
  INTO active_bookings_count
  FROM public.bookings
  WHERE room_id = room_uuid 
    AND booking_status IN ('confirmed', 'pending', 'on_hold')
    AND (hold_expires_at IS NULL OR hold_expires_at > now());
    
  -- Room is available if it's marked available and has capacity
  RETURN room_available AND (active_bookings_count < room_capacity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Fix function search path for update_room_availability
CREATE OR REPLACE FUNCTION public.update_room_availability()
RETURNS trigger AS $$
DECLARE
  room_uuid uuid;
  room_capacity integer;
  active_bookings integer;
BEGIN
  -- Get the room_id from NEW or OLD record
  room_uuid := COALESCE(NEW.room_id, OLD.room_id);
  
  IF room_uuid IS NOT NULL THEN
    -- Get room capacity
    SELECT capacity INTO room_capacity
    FROM public.rooms WHERE id = room_uuid;
    
    -- Count active bookings
    SELECT COUNT(*) INTO active_bookings
    FROM public.bookings
    WHERE room_id = room_uuid 
      AND booking_status IN ('confirmed', 'pending', 'on_hold')
      AND (hold_expires_at IS NULL OR hold_expires_at > now());
    
    -- Update room availability
    UPDATE public.rooms
    SET is_available = (active_bookings < room_capacity),
        occupied = active_bookings
    WHERE id = room_uuid;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Fix function search path for create_booking_with_conflict_check
CREATE OR REPLACE FUNCTION public.create_booking_with_conflict_check(
  p_student_id uuid,
  p_hostel_id uuid, 
  p_room_id uuid,
  p_total_amount numeric,
  p_semester text,
  p_academic_year text
)
RETURNS TABLE(success boolean, booking_id uuid, error_message text) AS $$
DECLARE
  new_booking_id uuid;
  room_available boolean;
BEGIN
  -- Check if room is available
  SELECT public.check_room_availability(p_room_id) INTO room_available;
  
  IF NOT room_available THEN
    RETURN QUERY SELECT false, null::uuid, 'Room is no longer available'::text;
    RETURN;
  END IF;
  
  -- Create the booking
  INSERT INTO public.bookings (
    student_id, hostel_id, room_id, total_amount, 
    semester, academic_year, booking_status
  ) VALUES (
    p_student_id, p_hostel_id, p_room_id, p_total_amount,
    p_semester, p_academic_year, 'pending'
  ) RETURNING id INTO new_booking_id;
  
  RETURN QUERY SELECT true, new_booking_id, null::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
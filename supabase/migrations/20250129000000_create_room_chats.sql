-- Create room_chats table for roommate messaging
CREATE TABLE IF NOT EXISTS public.room_chats (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_chats_room_id ON public.room_chats(room_id);
CREATE INDEX IF NOT EXISTS idx_room_chats_student_id ON public.room_chats(student_id);
CREATE INDEX IF NOT EXISTS idx_room_chats_created_at ON public.room_chats(created_at);

-- Enable RLS
ALTER TABLE public.room_chats ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see messages from rooms they've booked
CREATE POLICY "Users can view room chats for their booked rooms" ON public.room_chats
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM public.bookings 
            WHERE student_id = auth.uid() 
            AND booking_status IN ('confirmed', 'completed')
        )
    );

-- RLS Policy: Users can only send messages to rooms they've booked
CREATE POLICY "Users can send messages to their booked rooms" ON public.room_chats
    FOR INSERT WITH CHECK (
        auth.uid() = student_id AND
        room_id IN (
            SELECT room_id FROM public.bookings 
            WHERE student_id = auth.uid() 
            AND booking_status IN ('confirmed', 'completed')
        )
    );

-- RLS Policy: Users can update their own messages
CREATE POLICY "Users can update their own messages" ON public.room_chats
    FOR UPDATE USING (auth.uid() = student_id);

-- RLS Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON public.room_chats
    FOR DELETE USING (auth.uid() = student_id);

-- Create a function to get room chat participants
CREATE OR REPLACE FUNCTION get_room_chat_participants(room_uuid uuid)
RETURNS TABLE(
    student_id uuid,
    full_name text,
    avatar_url text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT DISTINCT 
        b.student_id,
        p.full_name,
        p.avatar_url
    FROM public.bookings b
    JOIN public.profiles p ON p.user_id = b.student_id
    WHERE b.room_id = room_uuid 
    AND b.booking_status IN ('confirmed', 'completed');
$$;

-- Create a function to get user's room chats
CREATE OR REPLACE FUNCTION get_user_room_chats(user_uuid uuid)
RETURNS TABLE(
    room_id uuid,
    room_number text,
    hostel_name text,
    hostel_id uuid,
    participant_count bigint,
    last_message text,
    last_message_at timestamp with time zone
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT DISTINCT 
        r.id as room_id,
        r.room_number,
        h.name as hostel_name,
        h.id as hostel_id,
        (SELECT COUNT(DISTINCT b2.student_id) 
         FROM public.bookings b2 
         WHERE b2.room_id = r.id 
         AND b2.booking_status IN ('confirmed', 'completed')) as participant_count,
        (SELECT rc.message 
         FROM public.room_chats rc 
         WHERE rc.room_id = r.id 
         ORDER BY rc.created_at DESC 
         LIMIT 1) as last_message,
        (SELECT rc.created_at 
         FROM public.room_chats rc 
         WHERE rc.room_id = r.id 
         ORDER BY rc.created_at DESC 
         LIMIT 1) as last_message_at
    FROM public.rooms r
    JOIN public.hostels h ON h.id = r.hostel_id
    JOIN public.bookings b ON b.room_id = r.id
    WHERE b.student_id = user_uuid 
    AND b.booking_status IN ('confirmed', 'completed')
    ORDER BY last_message_at DESC NULLS LAST;
$$;

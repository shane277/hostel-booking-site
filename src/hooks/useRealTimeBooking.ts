import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RealTimeRoom {
  id: string;
  hostel_id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  occupied: number;
  is_available: boolean;
  price_per_semester: number;
  price_per_academic_year?: number;
  amenities?: string[];
  images?: string[];
}

export const useRealTimeBooking = (hostelId?: string) => {
  const [rooms, setRooms] = useState<RealTimeRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch initial room data
  const fetchRooms = async () => {
    if (!hostelId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('room_number');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load room data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!hostelId) return;

    // Initial fetch
    fetchRooms();

    // Subscribe to room changes
    const roomSubscription = supabase
      .channel('room-availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `hostel_id=eq.${hostelId}`,
        },
        (payload) => {
          console.log('Room availability changed:', payload);
          
          if (payload.eventType === 'UPDATE') {
            setRooms(prev => prev.map(room => 
              room.id === payload.new.id 
                ? { ...room, ...payload.new }
                : room
            ));
          } else if (payload.eventType === 'INSERT') {
            setRooms(prev => [...prev, payload.new as RealTimeRoom]);
          } else if (payload.eventType === 'DELETE') {
            setRooms(prev => prev.filter(room => room.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to booking changes that affect room availability
    const bookingSubscription = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `hostel_id=eq.${hostelId}`,
        },
        (payload) => {
          console.log('Booking changed:', payload);
          // Room availability will be updated by the database trigger
          // This subscription helps us show real-time feedback to users
          
          if (payload.eventType === 'INSERT' && payload.new.student_id !== user?.id) {
            toast({
              title: "Room Status Update",
              description: `Room ${payload.new.room_id} booking status changed`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(bookingSubscription);
    };
  }, [hostelId, user?.id, toast]);

  // Enhanced booking function with conflict checking
  const bookRoomWithConflictCheck = async (
    roomId: string,
    hostelId: string,
    totalAmount: number,
    semester: string = 'Spring 2024',
    academicYear: string = '2024-2025'
  ) => {
    if (!user?.id) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_booking_with_conflict_check', {
        p_student_id: user.id,
        p_hostel_id: hostelId,
        p_room_id: roomId,
        p_total_amount: totalAmount,
        p_semester: semester,
        p_academic_year: academicYear,
      });

      if (error) throw error;

      const result = data[0];
      if (!result.success) {
        throw new Error(result.error_message);
      }

      toast({
        title: "Booking Created",
        description: "Your booking has been successfully created!",
      });

      return result.booking_id;
    } catch (error: unknown) {
      console.error('Booking error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create booking";
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Hold room function with automatic expiration
  const holdRoom = async (roomId: string, pricePerSemester: number) => {
    if (!user?.id) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    try {
      // Check if room is still available
      const room = rooms.find(r => r.id === roomId);
      if (!room || !room.is_available) {
        throw new Error('Room is no longer available');
      }

      const holdExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          hostel_id: hostelId!,
          room_id: roomId,
          total_amount: pricePerSemester,
          booking_status: 'on_hold',
          hold_expires_at: holdExpiresAt.toISOString(),
          semester: 'Spring 2024',
          academic_year: '2024-2025',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Room Held",
        description: "Room held for 24 hours. Complete payment to confirm booking.",
      });

      return data.id;
    } catch (error: unknown) {
      console.error('Hold room error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to hold room";
      toast({
        title: "Hold Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    rooms,
    loading,
    bookRoomWithConflictCheck,
    holdRoom,
    fetchRooms,
  };
};
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type BookingStatus = Database['public']['Enums']['booking_status'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

export interface BookingData {
  hostel_id: string;
  room_id?: string;
  semester: string;
  academic_year: string;
  total_amount: number;
  notes?: string;
}

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const holdRoom = async (roomId: string, hostelId: string, pricePerSemester: number) => {
    if (!user || profile?.user_type !== 'student') {
      toast({
        title: "Authentication Required",
        description: "Please login as a student to hold a room.",
        variant: "destructive",
      });
      return { error: "Not authenticated" };
    }

    setLoading(true);
    
    try {
      // Check if student already has an active booking for this hostel
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('student_id', user.id)
        .eq('hostel_id', hostelId)
        .in('booking_status', ['pending', 'confirmed', 'on_hold'] as BookingStatus[])
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingBooking) {
        toast({
          title: "Booking Already Exists",
          description: "You already have an active booking for this hostel.",
          variant: "destructive",
        });
        return { error: "Duplicate booking" };
      }

      // Create a 24-hour hold
      const holdExpiresAt = new Date();
      holdExpiresAt.setHours(holdExpiresAt.getHours() + 24);

      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}/${currentYear + 1}`;
      const semester = "first"; // Default to first semester

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          hostel_id: hostelId,
          room_id: roomId,
          semester,
          academic_year: academicYear,
          total_amount: pricePerSemester,
          booking_status: 'on_hold' as BookingStatus,
          payment_status: 'pending' as PaymentStatus,
          hold_expires_at: holdExpiresAt.toISOString(),
          notes: 'Room held for 24 hours'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Room Held Successfully!",
        description: `Room is held for 24 hours. Complete your booking before ${holdExpiresAt.toLocaleString()}.`,
      });

      return { data, error: null };
    } catch (error: unknown) {
      console.error('Error holding room:', error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast({
        title: "Failed to Hold Room",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const bookRoom = async (roomId: string, hostelId: string, pricePerSemester: number) => {
    if (!user || profile?.user_type !== 'student') {
      toast({
        title: "Authentication Required",
        description: "Please login as a student to book a room.",
        variant: "destructive",
      });
      return { error: "Not authenticated" };
    }

    setLoading(true);
    
    try {
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}/${currentYear + 1}`;
      const semester = "first"; // Default to first semester

      // Use the new conflict-checking function
      const { data, error } = await supabase.rpc('create_booking_with_conflict_check', {
        p_student_id: user.id,
        p_hostel_id: hostelId,
        p_room_id: roomId,
        p_total_amount: pricePerSemester,
        p_semester: semester,
        p_academic_year: academicYear,
      });

      if (error) throw error;

      const result = data[0];
      if (!result.success) {
        toast({
          title: "Booking Failed",
          description: result.error_message || "Room is no longer available",
          variant: "destructive",
        });
        return { error: result.error_message };
      }

      // Get the booking details for return
      const { data: bookingData, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', result.booking_id)
        .single();

      if (fetchError) throw fetchError;

      toast({
        title: "Booking Created!",
        description: "Your booking has been created. Proceed to payment to confirm.",
      });

      return { data: bookingData, error: null };
    } catch (error: unknown) {
      console.error('Error booking room:', error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast({
        title: "Failed to Book Room",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (bookingId: string, amount: number, hostelName: string, roomNumber: string) => {
    if (loading) return { error: "Please wait..." };
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          bookingId, 
          amount, 
          hostelName, 
          roomNumber 
        }
      });

      if (error) {
        console.error('Payment processing error:', error);
        return { error: error.message };
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }

      return { data, error: null };
    } catch (error: unknown) {
      console.error('Unexpected payment error:', error);
      const errorMessage = error instanceof Error ? error.message : "Payment processing failed";
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    holdRoom,
    bookRoom,
    processPayment,
    loading
  };
};
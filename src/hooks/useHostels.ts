import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Hostel {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  hostel_type: 'mixed' | 'male' | 'female';
  price_per_semester: number;
  price_per_academic_year?: number;
  security_deposit?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  total_rooms: number;
  available_rooms: number;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

interface Room {
  id: string;
  hostel_id: string;
  room_number: string;
  room_type: 'single' | 'double' | 'triple' | 'quad' | 'dormitory';
  capacity: number;
  occupied: number;
  price_per_semester: number;
  price_per_academic_year?: number;
  amenities?: string[];
  images?: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export const useHostels = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHostels = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHostels(data || []);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hostels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createHostel = async (hostelData: Omit<Hostel, 'id' | 'landlord_id' | 'created_at' | 'updated_at' | 'rating' | 'total_reviews'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('hostels')
        .insert({
          ...hostelData,
          landlord_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setHostels(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Hostel created successfully"
      });
      return data;
    } catch (error) {
      console.error('Error creating hostel:', error);
      toast({
        title: "Error",
        description: "Failed to create hostel",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateHostel = async (id: string, updates: Partial<Hostel>) => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setHostels(prev => prev.map(h => h.id === id ? data : h));
      toast({
        title: "Success",
        description: "Hostel updated successfully"
      });
      return data;
    } catch (error) {
      console.error('Error updating hostel:', error);
      toast({
        title: "Error",
        description: "Failed to update hostel",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteHostel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hostels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHostels(prev => prev.filter(h => h.id !== id));
      toast({
        title: "Success",
        description: "Hostel deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting hostel:', error);
      toast({
        title: "Error",
        description: "Failed to delete hostel",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchHostels();
  }, [user, fetchHostels]);

  return {
    hostels,
    loading,
    createHostel,
    updateHostel,
    deleteHostel,
    refetch: fetchHostels
  };
};

export const useRooms = (hostelId?: string) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
        description: "Failed to fetch rooms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert(roomData)
        .select()
        .single();

      if (error) throw error;

      setRooms(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Room created successfully"
      });
      return data;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateRoom = async (id: string, updates: Partial<Room>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setRooms(prev => prev.map(r => r.id === id ? data : r));
      toast({
        title: "Success",
        description: "Room updated successfully"
      });
      return data;
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRooms(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Success",
        description: "Room deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hostelId, fetchRooms]);

  return {
    rooms,
    loading,
    createRoom,
    updateRoom,
    deleteRoom,
    refetch: fetchRooms
  };
};
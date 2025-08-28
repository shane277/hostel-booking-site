import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RoomChatMessage {
  id: string;
  room_id: string;
  student_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface UserRoomChat {
  room_id: string;
  room_number: string;
  hostel_name: string;
  hostel_id: string;
  participant_count: number;
  last_message?: string;
  last_message_at?: string;
}

export interface RoomChatParticipant {
  student_id: string;
  full_name: string;
  avatar_url?: string;
}

export const useRoomChats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRoomChats, setUserRoomChats] = useState<UserRoomChat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoomChats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_room_chats', { user_uuid: user.id });

      if (error) throw error;
      setUserRoomChats(data || []);
    } catch (error) {
      console.error('Error fetching user room chats:', error);
      toast({
        title: "Error",
        description: "Failed to load your room chats.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchUserRoomChats();
  }, [fetchUserRoomChats]);

  return {
    userRoomChats,
    loading,
    refetch: fetchUserRoomChats
  };
};

export const useRoomChat = (roomId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<RoomChatMessage[]>([]);
  const [participants, setParticipants] = useState<RoomChatParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      const { data, error } = await supabase
        .from('room_chats')
        .select(`
          *,
          profiles!room_chats_student_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map(msg => ({
        id: msg.id,
        room_id: msg.room_id,
        student_id: msg.student_id,
        message: msg.message,
        created_at: msg.created_at,
        sender_name: msg.profiles?.full_name || 'Unknown User',
        sender_avatar: msg.profiles?.avatar_url
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [roomId, toast]);

  const fetchParticipants = useCallback(async () => {
    if (!roomId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_room_chat_participants', { room_uuid: roomId });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  }, [roomId]);

  const sendMessage = async (messageText: string) => {
    if (!user || !roomId || !messageText.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('room_chats')
        .insert([{
          room_id: roomId,
          student_id: user.id,
          message: messageText.trim()
        }]);

      if (error) throw error;

      // Message will be added via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!roomId) return;

    fetchMessages();
    fetchParticipants();

    const subscription = supabase
      .channel(`room_chat_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_chats',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new message with profile data
            supabase
              .from('room_chats')
              .select(`
                *,
                profiles!room_chats_student_id_fkey (
                  full_name,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  const newMessage = {
                    id: data.id,
                    room_id: data.room_id,
                    student_id: data.student_id,
                    message: data.message,
                    created_at: data.created_at,
                    sender_name: data.profiles?.full_name || 'Unknown User',
                    sender_avatar: data.profiles?.avatar_url
                  };
                  setMessages(prev => [...prev, newMessage]);
                }
              });
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId, fetchMessages, fetchParticipants]);

  return {
    messages,
    participants,
    loading,
    sending,
    sendMessage,
    refetch: fetchMessages
  };
};

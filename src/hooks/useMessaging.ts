import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  hostel_id?: string;
  booking_id?: string;
  message_type: string;
  content: string;
  read_at?: string;
  created_at: string;
  sender_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  student_id: string;
  landlord_id: string;
  hostel_id?: string;
  booking_id?: string;
  last_message_at: string;
  created_at: string;
  hostel?: {
    name: string;
  };
  student_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  landlord_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
    read_at?: string;
  };
}

export const useMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Fetch conversations with profile and hostel data
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          hostels(name),
          student_profile:profiles!conversations_student_id_fkey(full_name, avatar_url),
          landlord_profile:profiles!conversations_landlord_id_fkey(full_name, avatar_url),
          last_message:messages(content, created_at, sender_id)
        `)
        .or(`student_id.eq.${user.id},landlord_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
        .limit(1, { foreignTable: 'last_message' });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = data?.map((conv: Record<string, unknown>) => ({
        ...conv,
        hostel: conv.hostels ? { name: (conv.hostels as { name: string }).name } : null,
        last_message: conv.last_message?.[0] || null
      })) || [];
      
      setConversations(transformedData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`*`)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      // Mark messages as read
      if (data && data.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .eq('recipient_id', user.id)
          .is('read_at', null);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Get unread message count
  const getUnreadCount = useCallback(() => {
    return conversations.reduce((count, conv) => {
      if (conv.last_message && 
          conv.last_message.sender_id !== user?.id && 
          !conv.last_message.read_at) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [conversations, user?.id]);

  // Create or get conversation
  const createOrGetConversation = useCallback(async (
    recipientId: string,
    hostelId?: string,
    bookingId?: string
  ) => {
    if (!user) return null;
    
    try {
      // Determine correct user roles
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', recipientId)
        .single();

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      // Set student and landlord IDs correctly
      let studentId = user.id;
      let landlordId = recipientId;
      
      if (userProfile?.user_type === 'landlord') {
        studentId = recipientId;
        landlordId = user.id;
      }

      // Check if conversation exists with any combination
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('student_id', studentId)
        .eq('landlord_id', landlordId)
        .eq('hostel_id', hostelId || null)
        .maybeSingle();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          student_id: studentId,
          landlord_id: landlordId,
          hostel_id: hostelId,
          booking_id: bookingId
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  // Send message
  const sendMessage = useCallback(async (
    content: string,
    recipientId: string,
    conversationId?: string,
    hostelId?: string,
    bookingId?: string
  ) => {
    if (!user) return;
    
    try {
      let targetConversationId = conversationId;
      
      if (!targetConversationId) {
        targetConversationId = await createOrGetConversation(recipientId, hostelId, bookingId);
        if (!targetConversationId) return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: targetConversationId,
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          hostel_id: hostelId,
          booking_id: bookingId
        });

      if (error) throw error;

      // Send notification to recipient
      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'new_message',
          title: 'New Message',
          message: `You have a new message`,
          data: { 
            conversation_id: targetConversationId,
            sender_id: user.id 
          }
        });

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully"
      });

      // Refresh conversations and messages
      fetchConversations();
      if (selectedConversationId === targetConversationId) {
        fetchMessages(targetConversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  }, [user, toast, createOrGetConversation, fetchConversations, fetchMessages, selectedConversationId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          fetchConversations();
          if (selectedConversationId) {
            fetchMessages(selectedConversationId);
          }
        }
      )
      .subscribe();

    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, fetchConversations, fetchMessages, selectedConversationId]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    messages,
    loading,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage,
    fetchMessages,
    createOrGetConversation,
    unreadCount: getUnreadCount()
  };
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Send, Phone, User, ExternalLink } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface MessageCenterProps {
  recipientId?: string;
  hostelId?: string;
  bookingId?: string;
  className?: string;
}

export const MessageCenter: React.FC<MessageCenterProps> = ({
  recipientId,
  hostelId,
  bookingId,
  className
}) => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    loading,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage,
    fetchMessages
  } = useMessaging();
  
  const [newMessage, setNewMessage] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    fetchMessages(conversationId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    if (selectedConversationId) {
      const conversation = conversations.find(c => c.id === selectedConversationId);
      if (conversation) {
        const recipientId = conversation.student_id === user.id 
          ? conversation.landlord_id 
          : conversation.student_id;
        
        await sendMessage(newMessage, recipientId, selectedConversationId);
        setNewMessage('');
      }
    } else if (recipientId) {
      await sendMessage(newMessage, recipientId, undefined, hostelId, bookingId);
      setNewMessage('');
    }
  };

  const openWhatsApp = () => {
    if (whatsappNumber) {
      const message = encodeURIComponent("Hi! I'm interested in your hostel listing.");
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No conversations yet</div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation) => {
                  const isSelected = selectedConversationId === conversation.id;
                  const otherUser = conversation.student_id === user?.id 
                    ? conversation.landlord_profile 
                    : conversation.student_profile;
                  const hasUnread = conversation.last_message && 
                    conversation.last_message.sender_id !== user?.id && 
                    !conversation.last_message.read_at;
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={otherUser?.avatar_url || ""} />
                            <AvatarFallback>
                              {otherUser?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          {hasUnread && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-ghana-red rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${hasUnread ? 'font-semibold' : 'font-medium'}`}>
                              {otherUser?.full_name || 'Unknown User'}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {conversation.last_message?.created_at 
                                ? formatDistanceToNow(new Date(conversation.last_message.created_at)) + ' ago'
                                : formatDistanceToNow(new Date(conversation.last_message_at)) + ' ago'
                              }
                            </span>
                          </div>
                          {conversation.hostel && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.hostel.name}
                            </p>
                          )}
                          {conversation.last_message && (
                            <p className={`text-xs truncate ${hasUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {conversation.last_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {selectedConversation 
                ? `Chat - ${selectedConversation.hostel?.name || 'Conversation'}`
                : 'Select a conversation'
              }
            </span>
            <div className="flex gap-2">
              <Dialog open={showWhatsApp} onOpenChange={setShowWhatsApp}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact via WhatsApp</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">WhatsApp Number</label>
                      <Input
                        placeholder="e.g., +233123456789"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                      />
                    </div>
                    <Button onClick={openWhatsApp} className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open WhatsApp
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedConversationId ? (
            <div className="space-y-4">
              {/* Messages */}
              <ScrollArea className="h-80 border rounded-lg p-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatDistanceToNow(new Date(message.created_at))} ago
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[80px]"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
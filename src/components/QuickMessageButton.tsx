import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';

interface QuickMessageButtonProps {
  recipientId: string;
  hostelId?: string;
  bookingId?: string;
  recipientName?: string;
  hostelName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const QuickMessageButton: React.FC<QuickMessageButtonProps> = ({
  recipientId,
  hostelId,
  bookingId,
  recipientName,
  hostelName,
  variant = "outline",
  size = "sm",
  className
}) => {
  const { user } = useAuth();
  const { sendMessage } = useMessaging();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    
    setSending(true);
    try {
      await sendMessage(message, recipientId, undefined, hostelId, bookingId);
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getDefaultMessage = () => {
    if (hostelName) {
      return `Hi! I'm interested in your hostel "${hostelName}". Could you please provide more information?`;
    }
    return "Hi! I'd like to know more about your listing. Could you please provide additional details?";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Send Message{recipientName && ` to ${recipientName}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {hostelName && (
            <div className="text-sm text-muted-foreground">
              Regarding: <span className="font-medium">{hostelName}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage(getDefaultMessage())}
                disabled={sending}
              >
                Use Template
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
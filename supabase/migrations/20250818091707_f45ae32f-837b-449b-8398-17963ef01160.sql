-- Add foreign key constraints for better data integrity
ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_hostel_id 
FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE;

ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_booking_id 
FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_hostel_id 
FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_booking_id 
FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_student_landlord 
ON conversations(student_id, landlord_id);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at 
ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_recipient_read 
ON messages(recipient_id, read_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);
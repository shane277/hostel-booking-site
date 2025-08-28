import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoomChats } from '@/hooks/useRoomChats';
import { MessageCircle, Users, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RoomChatList: React.FC = () => {
  const { userRoomChats, loading } = useRoomChats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Your Room Chats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (userRoomChats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Your Room Chats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Room Chats Yet</h3>
            <p className="text-muted-foreground mb-4">
              You'll see chat rooms here once you book a room and it's confirmed.
            </p>
            <Button asChild variant="outline">
              <Link to="/search">Find Hostels</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Your Room Chats
          <Badge variant="secondary">{userRoomChats.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {userRoomChats.map((roomChat) => (
            <Card key={roomChat.room_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">
                        Room {roomChat.room_number}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {roomChat.participant_count}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 truncate">
                      {roomChat.hostel_name}
                    </p>

                    {roomChat.last_message ? (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {roomChat.last_message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(roomChat.last_message_at!), { addSuffix: true })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No messages yet
                      </p>
                    )}
                  </div>

                  <Button asChild size="sm" variant="ghost" className="ml-2">
                    <Link to={`/room-chat/${roomChat.room_id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: Only confirmed roommates can see and send messages in these chats
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomChatList;

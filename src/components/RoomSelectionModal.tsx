import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Bed, 
  Users, 
  Wifi, 
  Car, 
  Utensils, 
  Shirt, 
  Shield, 
  Zap, 
  Dumbbell, 
  BookOpen, 
  Coffee, 
  Tv,
  CheckCircle,
  X,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  occupied: number;
  price_per_semester: number;
  price_per_academic_year: number;
  amenities: string[];
  images: string[];
  is_available: boolean;
  hostel_id: string;
}

interface RoomSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostelId: string;
  hostelName: string;
  onRoomSelected: (room: Room) => void;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  wifi: <Wifi className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  kitchen: <Utensils className="h-4 w-4" />,
  laundry: <Shirt className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  gym: <Dumbbell className="h-4 w-4" />,
  study_room: <BookOpen className="h-4 w-4" />,
  cafe: <Coffee className="h-4 w-4" />,
  tv: <Tv className="h-4 w-4" />,
  air_conditioning: <Zap className="h-4 w-4" />
};

const roomTypeLabels: { [key: string]: string } = {
  '2-in-a-room': '2 Beds per Room',
  '4-in-a-room': '4 Beds per Room',
  '6-in-a-room': '6 Beds per Room',
  'single': 'Single Room',
  'male': 'Male Room',
  'female': 'Female Room',
  'mixed': 'Mixed Room'
};

export const RoomSelectionModal: React.FC<RoomSelectionModalProps> = ({
  isOpen,
  onClose,
  hostelId,
  hostelName,
  onRoomSelected
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && hostelId) {
      fetchRooms();
    }
  }, [isOpen, hostelId]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hostel_id', hostelId)
        .eq('is_available', true)
        .order('room_type')
        .order('room_number');

      if (error) throw error;
      setRooms(data || []);
      
      // Set first room type as default
      if (data && data.length > 0) {
        setSelectedRoomType(data[0].room_type);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load available rooms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBeds = (room: Room) => {
    return room.capacity - room.occupied;
  };

  const getRoomTypeRooms = (roomType: string) => {
    return rooms.filter(room => room.room_type === roomType);
  };

  const getRoomTypes = () => {
    return [...new Set(rooms.map(room => room.room_type))];
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleConfirmSelection = () => {
    if (selectedRoom) {
      onRoomSelected(selectedRoom);
      onClose();
    }
  };

  const getRoomTypeDisplayName = (roomType: string) => {
    return roomTypeLabels[roomType] || roomType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Your Room</DialogTitle>
            <DialogDescription>
              Choose from available rooms at {hostelName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading available rooms...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Select Your Room
          </DialogTitle>
          <DialogDescription>
            Choose from available rooms at {hostelName}
          </DialogDescription>
        </DialogHeader>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Rooms Available</h3>
            <p className="text-muted-foreground mb-4">
              All rooms in this hostel are currently occupied.
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Room Type Tabs */}
            <div className="border-b">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getRoomTypes().map((roomType) => (
                  <Button
                    key={roomType}
                    variant={selectedRoomType === roomType ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRoomType(roomType)}
                    className="whitespace-nowrap"
                  >
                    {getRoomTypeDisplayName(roomType)}
                    <Badge variant="secondary" className="ml-2">
                      {getRoomTypeRooms(roomType).length}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getRoomTypeRooms(selectedRoomType).map((room) => {
                const availableBeds = getAvailableBeds(room);
                const isSelected = selectedRoom?.id === room.id;
                
                return (
                  <Card 
                    key={room.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                        {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getRoomTypeDisplayName(room.room_type)}
                        </Badge>
                        <Badge variant={availableBeds > 0 ? "default" : "destructive"}>
                          {availableBeds} bed{availableBeds !== 1 ? 's' : ''} available
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Pricing */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Semester Price:</span>
                          <span className="font-semibold">₵{room.price_per_semester.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Academic Year:</span>
                          <span className="font-semibold">₵{room.price_per_academic_year.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Bed Status */}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {room.occupied}/{room.capacity} beds occupied
                        </span>
                      </div>

                      {/* Amenities */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Room Amenities:</p>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.slice(0, 4).map((amenity) => (
                              <div key={amenity} className="flex items-center gap-1 text-xs text-muted-foreground">
                                {amenityIcons[amenity] || <Shield className="h-3 w-3" />}
                                <span>{amenity.replace('_', ' ')}</span>
                              </div>
                            ))}
                            {room.amenities.length > 4 && (
                              <span className="text-xs text-muted-foreground">
                                +{room.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Selection Status */}
                      {isSelected && (
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                          <CheckCircle className="h-4 w-4" />
                          Selected for booking
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmSelection}
                disabled={!selectedRoom}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Continue to Booking
              </Button>
            </div>

            {/* Selection Summary */}
            {selectedRoom && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-medium mb-2">Selected Room Summary:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Room:</span>
                    <span className="ml-2 font-medium">{selectedRoom.room_number}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">{getRoomTypeDisplayName(selectedRoom.room_type)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available Beds:</span>
                    <span className="ml-2 font-medium">{getAvailableBeds(selectedRoom)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Semester Price:</span>
                    <span className="ml-2 font-medium">₵{selectedRoom.price_per_semester.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};


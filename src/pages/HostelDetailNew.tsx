import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar,
  Bed,
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
  Phone,
  Mail
} from 'lucide-react';

interface Hostel {
  id: string;
  name: string;
  description: string;
  location: string;
  university: string;
  latitude: number;
  longitude: number;
  walk_minutes: number;
  drive_minutes: number;
  images: string[];
  created_at: string;
  rooms: Room[];
}

interface Room {
  id: string;
  gender: 'male' | 'female' | 'mixed';
  capacity: number;
  room_count: number;
  price_per_bed: number;
  amenities: string[];
}

const facilityIcons: { [key: string]: React.ReactNode } = {
  wifi: <Wifi className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  kitchen: <Utensils className="h-4 w-4" />,
  laundry: <Shirt className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  generator: <Zap className="h-4 w-4" />,
  gym: <Dumbbell className="h-4 w-4" />,
  study_room: <BookOpen className="h-4 w-4" />,
  common_room: <Coffee className="h-4 w-4" />,
  tv_room: <Tv className="h-4 w-4" />
};

const facilityLabels: { [key: string]: string } = {
  wifi: 'WiFi',
  parking: 'Parking',
  kitchen: 'Kitchen',
  laundry: 'Laundry',
  security: '24/7 Security',
  generator: 'Backup Generator',
  gym: 'Gym/Fitness',
  study_room: 'Study Room',
  common_room: 'Common Room',
  tv_room: 'TV Room'
};

const HostelDetailNew = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchHostelDetails();
    }
  }, [id]);

  const fetchHostelDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select(`
          *,
          rooms (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setHostel(data);
    } catch (error) {
      console.error('Error fetching hostel details:', error);
      toast({
        title: "Error",
        description: "Failed to load hostel details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    toast({
      title: "Booking Feature",
      description: "Booking functionality will be implemented soon!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <BackButton />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <BackButton />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Hostel Not Found</h1>
            <p className="text-muted-foreground">The hostel you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalRooms = hostel.rooms.reduce((total, room) => total + room.room_count, 0);
  const totalBeds = hostel.rooms.reduce((total, room) => total + (room.room_count * room.capacity), 0);
  const minPrice = Math.min(...hostel.rooms.map(room => room.price_per_bed));
  const maxPrice = Math.max(...hostel.rooms.map(room => room.price_per_bed));
  const maleRooms = hostel.rooms.filter(room => room.gender === 'male').reduce((total, room) => total + room.room_count, 0);
  const femaleRooms = hostel.rooms.filter(room => room.gender === 'female').reduce((total, room) => total + room.room_count, 0);
  const mixedRooms = hostel.rooms.filter(room => room.gender === 'mixed').reduce((total, room) => total + room.room_count, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BackButton />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{hostel.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{hostel.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Near {hostel.university}</span>
              </div>

              {/* Distance Information */}
              {(hostel.walk_minutes || hostel.drive_minutes) && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {hostel.walk_minutes && (
                    <div className="flex items-center gap-1">
                      <span>🚶</span>
                      <span>{hostel.walk_minutes} min walk</span>
                    </div>
                  )}
                  {hostel.drive_minutes && (
                    <div className="flex items-center gap-1">
                      <span>🚗</span>
                      <span>{hostel.drive_minutes} min drive</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images and Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              {hostel.images && hostel.images.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={hostel.images[currentImageIndex]}
                        alt={`${hostel.name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-64 md:h-80 object-cover rounded-t-lg"
                      />
                      {hostel.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {hostel.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">No images available</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Hostel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {hostel.description || 'No description available for this hostel.'}
                  </p>
                </CardContent>
              </Card>

              {/* Room Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Types & Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hostel.rooms.map((room) => (
                      <div key={room.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              room.gender === 'male' ? 'default' : 
                              room.gender === 'female' ? 'secondary' : 'outline'
                            }>
                              {room.gender.charAt(0).toUpperCase() + room.gender.slice(1)}
                            </Badge>
                            <span className="font-medium">
                              {room.capacity}-in-a-room
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">₵{room.price_per_bed.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">per bed</div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-3">
                          {room.room_count} {room.room_count === 1 ? 'room' : 'rooms'} • {room.room_count * room.capacity} beds total
                        </div>

                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.map((amenityId) => (
                              <div key={amenityId} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                                {facilityIcons[amenityId] || <Users className="h-3 w-3" />}
                                <span>{facilityLabels[amenityId] || amenityId}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Card */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing & Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {minPrice === maxPrice ? (
                        `₵${minPrice.toLocaleString()}`
                      ) : (
                        `₵${minPrice.toLocaleString()} - ₵${maxPrice.toLocaleString()}`
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per bed
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Rooms:</span>
                      <span className="font-medium">{totalRooms}</span>
                    </div>
                    
                    {maleRooms > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Male Rooms:</span>
                        <span className="font-medium">{maleRooms}</span>
                      </div>
                    )}
                    
                    {femaleRooms > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Female Rooms:</span>
                        <span className="font-medium">{femaleRooms}</span>
                      </div>
                    )}

                    {mixedRooms > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mixed Rooms:</span>
                        <span className="font-medium">{mixedRooms}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Beds:</span>
                      <span className="font-medium">{totalBeds}</span>
                    </div>
                  </div>

                  {/* Room Type Badges */}
                  <div className="flex gap-2 flex-wrap">
                    {maleRooms > 0 && (
                      <Badge variant="outline">Male Rooms Available</Badge>
                    )}
                    {femaleRooms > 0 && (
                      <Badge variant="outline">Female Rooms Available</Badge>
                    )}
                    {mixedRooms > 0 && (
                      <Badge variant="outline">Mixed Rooms Available</Badge>
                    )}
                  </div>

                  {/* Booking Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleBooking}
                  >
                    Book Now
                  </Button>

                  <div className="text-xs text-center text-muted-foreground">
                    Listed on {new Date(hostel.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    For inquiries about this property, please contact us.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>+233 XXX XXX XXX</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>info@hostelpadi.com</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelDetailNew;

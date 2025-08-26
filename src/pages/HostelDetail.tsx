
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Users, Wifi, Car, Shield, ArrowLeft, Heart, Calendar, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/hooks/useBooking";
import { useRealTimeBooking } from "@/hooks/useRealTimeBooking";
import { useReviews, ReviewData } from "@/hooks/useReviews";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewsSummary } from "@/components/ReviewsSummary";
import { QuickMessageButton } from "@/components/QuickMessageButton";

interface Hostel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  region: string;
  rating: number;
  total_reviews: number;
  price_per_semester: number;
  price_per_academic_year: number;
  security_deposit: number;
  images: string[];
  amenities: string[];
  available_rooms: number;
  total_rooms: number;
  hostel_type: string;
  is_verified: boolean;
  landlord_id: string;
}

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
}

const HostelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { processPayment, loading: bookingLoading } = useBooking();
  const { 
    rooms, 
    loading: roomsLoading,
    bookRoomWithConflictCheck,
    holdRoom: holdRoomRealTime 
  } = useRealTimeBooking(id);
  const { fetchHostelReviews } = useReviews();

  const loadReviews = async () => {
    if (!id) return;
    const reviewsData = await fetchHostelReviews(id);
    setReviews(reviewsData);
  };

  const fetchHostelDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setHostel(data);
      console.log('Hostel data:', data);
    } catch (error) {
      console.error('Error fetching hostel:', error);
      toast({
        title: "Error",
        description: "Failed to load hostel details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHostelDetails();
      loadReviews();
    }
  }, [id, fetchHostelDetails, loadReviews]);


  const handleHoldRoom = async (roomId: string, roomPrice: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to hold a room.",
        variant: "destructive",
      });
      return;
    }

    if (profile?.user_type !== 'student') {
      toast({
        title: "Student Account Required",
        description: "Only students can book rooms.",
        variant: "destructive",
      });
      return;
    }

    try {
      await holdRoomRealTime(roomId, roomPrice);
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const handleBookRoom = async (roomId: string, roomPrice: number, roomNumber: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book a room.",
        variant: "destructive",
      });
      return;
    }

    if (profile?.user_type !== 'student') {
      toast({
        title: "Student Account Required",
        description: "Only students can book rooms.",
        variant: "destructive",
      });
      return;
    }

    try {
      const bookingId = await bookRoomWithConflictCheck(
        roomId, 
        id!, 
        roomPrice, 
        'Spring 2024', 
        '2024-2025'
      );
      
      if (bookingId) {
        // Proceed to payment
        await processPayment(bookingId, roomPrice, hostel?.name || 'Hostel', roomNumber);
      }
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading || roomsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
              <div className="h-64 bg-muted rounded"></div>
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
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Hostel Not Found</h1>
          <p className="text-muted-foreground mb-8">The hostel you're looking for doesn't exist or is no longer available.</p>
          <Link to="/search">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/search" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Link>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2">
            <div className="aspect-[16/10] overflow-hidden rounded-lg">
              <img 
                src={hostel.images[selectedImage] || "/placeholder.svg"} 
                alt={hostel.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {hostel.images.slice(1, 5).map((image, index) => (
              <div 
                key={index + 1}
                className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedImage(index + 1)}
              >
                <img 
                  src={image || "/placeholder.svg"} 
                  alt={`${hostel.name} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{hostel.name}</h1>
                  {hostel.is_verified && (
                    <Badge className="bg-success text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{hostel.address}, {hostel.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{hostel.available_rooms} of {hostel.total_rooms} rooms available</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-ghana-gold text-ghana-gold" />
                    <span className="font-medium">{hostel.rating}</span>
                    <span className="text-muted-foreground">({hostel.total_reviews} reviews)</span>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {hostel.hostel_type} hostel
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? 'text-ghana-red' : 'text-muted-foreground'}
              >
                <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
              </Button>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About This Hostel</h2>
              <p className="text-muted-foreground leading-relaxed">{hostel.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-3">
                {hostel.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-2 px-3">
                    {getAmenityIcon(amenity)}
                    <span className="ml-2">{amenity}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tabs for Rooms and Reviews */}
            <Tabs defaultValue="rooms" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="rooms">Available Rooms</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({hostel.total_reviews})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rooms" className="mt-6">
                {rooms.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No rooms available at the moment</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {rooms.map((room) => (
                      <Card key={room.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">Room {room.room_number}</h3>
                                <Badge variant="outline" className="capitalize">
                                  {room.room_type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-muted-foreground mb-3">
                                <span>Capacity: {room.capacity} students</span>
                                <span>Occupied: {room.occupied}/{room.capacity}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {room.amenities.map((amenity, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary mb-1">
                                ₵{room.price_per_semester.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground mb-4">per semester</div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleHoldRoom(room.id, room.price_per_semester)}
                                   disabled={bookingLoading || !room.is_available}
                                >
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {bookingLoading ? "Holding..." : "Hold"}
                                </Button>
                                <Button 
                                  variant="ghana" 
                                  size="sm"
                                  onClick={() => handleBookRoom(room.id, room.price_per_semester, room.room_number)}
                                  disabled={bookingLoading || !room.is_available}
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  {bookingLoading ? "Booking..." : "Book Now"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {/* Reviews Summary */}
                  <ReviewsSummary 
                    reviews={reviews} 
                    totalRating={hostel.rating} 
                    totalReviews={hostel.total_reviews} 
                  />
                  
                  {/* Individual Reviews */}
                  {reviews.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Student Reviews</h3>
                      {reviews.map((review) => (
                        <ReviewCard 
                          key={review.id} 
                          review={review} 
                          onUpdate={loadReviews}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-1">
                    ₵{hostel.price_per_semester.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">starting price per semester</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Academic Year Price:</span>
                    <span className="font-medium">₵{hostel.price_per_academic_year?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Security Deposit:</span>
                    <span className="font-medium">₵{hostel.security_deposit?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available Rooms:</span>
                    <span className="font-medium">{hostel.available_rooms}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!user || profile?.user_type !== 'student' || hostel.available_rooms === 0}
                    onClick={() => {
                      if (rooms.length > 0) {
                        handleBookRoom(rooms[0].id, rooms[0].price_per_semester, rooms[0].room_number);
                      }
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {bookingLoading ? "Booking..." : "Quick Book"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    disabled={!user || profile?.user_type !== 'student' || hostel.available_rooms === 0}
                    onClick={() => {
                      if (rooms.length > 0) {
                        handleHoldRoom(rooms[0].id, rooms[0].price_per_semester);
                      }
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {bookingLoading ? "Holding..." : "Hold Room (24hrs)"}
                  </Button>
                  
                  <QuickMessageButton
                    recipientId={hostel.landlord_id}
                    hostelId={hostel.id}
                    hostelName={hostel.name}
                    recipientName="Landlord"
                    variant="outline"
                    className="w-full"
                    size="lg"
                  />
                </div>

                {!user && (
                  <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">Login to book rooms</p>
                    <Link to="/auth">
                      <Button variant="ghost" size="sm">
                        Login / Sign Up
                      </Button>
                    </Link>
                  </div>
                )}

                {user && profile?.user_type !== 'student' && (
                  <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Only students can book rooms</p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t text-center">
                  <p className="text-sm text-muted-foreground mb-2">Need help choosing?</p>
                  <Button variant="ghost" size="sm">
                    Contact Landlord
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelDetail;

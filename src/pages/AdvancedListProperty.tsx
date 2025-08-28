import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building, 
  MapPin, 
  Users, 
  DollarSign, 
  Upload, 
  Plus, 
  Trash2,
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
  Bath
} from 'lucide-react';

interface RoomType {
  id: string;
  gender: 'male' | 'female' | 'mixed';
  capacity: number;
  room_count: number;
  price_per_bed: string;
  amenities: string[];
}

interface FormData {
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  university: string;
  walk_minutes: string;
  drive_minutes: string;
  auto_calculate_distance: boolean;
  description: string;
  images: File[];
  roomTypes: RoomType[];
}

const AdvancedListProperty = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    latitude: null,
    longitude: null,
    university: '',
    walk_minutes: '',
    drive_minutes: '',
    auto_calculate_distance: true,
    description: '',
    images: [],
    roomTypes: [{
      id: '1',
      gender: 'male',
      capacity: 2,
      room_count: 1,
      price_per_bed: '',
      amenities: []
    }]
  });

  const universities = [
    'University of Ghana (Legon)',
    'Kwame Nkrumah University of Science and Technology (KNUST)',
    'University of Cape Coast (UCC)',
    'Ghana Institute of Management and Public Administration (GIMPA)',
    'University of Education, Winneba (UEW)',
    'Ashesi University',
    'Central University',
    'Valley View University',
    'Presbyterian University',
    'Methodist University'
  ];

  const availableAmenities = [
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
    { id: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" /> },
    { id: 'kitchen', label: 'Kitchen', icon: <Utensils className="h-4 w-4" /> },
    { id: 'laundry', label: 'Laundry', icon: <Shirt className="h-4 w-4" /> },
    { id: 'security', label: '24/7 Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'generator', label: 'Backup Generator', icon: <Zap className="h-4 w-4" /> },
    { id: 'gym', label: 'Gym/Fitness', icon: <Dumbbell className="h-4 w-4" /> },
    { id: 'study_room', label: 'Study Room', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'common_room', label: 'Common Room', icon: <Coffee className="h-4 w-4" /> },
    { id: 'tv_room', label: 'TV Room', icon: <Tv className="h-4 w-4" /> },
    { id: 'private_bathroom', label: 'Private Bathroom', icon: <Bath className="h-4 w-4" /> }
  ];

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && window.google) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 5.6037, lng: -0.1870 }, // Accra, Ghana
          zoom: 12,
        });
        
        const markerInstance = new google.maps.Marker({
          map: mapInstance,
          draggable: true,
        });

        // Add click listener to map
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            markerInstance.setPosition({ lat, lng });
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng
            }));
          }
        });

        // Add drag listener to marker
        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition();
          if (position) {
            setFormData(prev => ({
              ...prev,
              latitude: position.lat(),
              longitude: position.lng()
            }));
          }
        });

        setMap(mapInstance);
        setMarker(markerInstance);
      }
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate distance using Google Maps API
  const calculateDistance = async (hostelLat: number, hostelLng: number, university: string) => {
    if (!window.google) return;

    try {
      const service = new google.maps.DistanceMatrixService();
      
      // University coordinates (you may want to store these in a database)
      const universityCoords: { [key: string]: { lat: number; lng: number } } = {
        'University of Ghana (Legon)': { lat: 5.6510, lng: -0.1870 },
        'Kwame Nkrumah University of Science and Technology (KNUST)': { lat: 6.6745, lng: -1.5716 },
        'University of Cape Coast (UCC)': { lat: 5.1056, lng: -1.2833 },
        'Ghana Institute of Management and Public Administration (GIMPA)': { lat: 5.6037, lng: -0.1870 },
        'University of Education, Winneba (UEW)': { lat: 5.3475, lng: -0.6218 },
        'Ashesi University': { lat: 5.7614, lng: -0.2556 },
        'Central University': { lat: 5.6037, lng: -0.1870 },
        'Valley View University': { lat: 5.6037, lng: -0.1870 },
        'Presbyterian University': { lat: 5.6037, lng: -0.1870 },
        'Methodist University': { lat: 5.6037, lng: -0.1870 }
      };

      const universityCoord = universityCoords[university];
      if (!universityCoord) return;

      service.getDistanceMatrix({
        origins: [{ lat: hostelLat, lng: hostelLng }],
        destinations: [universityCoord],
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
      }, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          const walkTime = response.rows[0]?.elements[0]?.duration?.value;
          if (walkTime) {
            setFormData(prev => ({
              ...prev,
              walk_minutes: Math.round(walkTime / 60).toString()
            }));
          }
        }
      });

      // Get driving distance
      service.getDistanceMatrix({
        origins: [{ lat: hostelLat, lng: hostelLng }],
        destinations: [universityCoord],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      }, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          const driveTime = response.rows[0]?.elements[0]?.duration?.value;
          if (driveTime) {
            setFormData(prev => ({
              ...prev,
              drive_minutes: Math.round(driveTime / 60).toString()
            }));
          }
        }
      });

    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  // Auto-calculate distance when coordinates or university changes
  useEffect(() => {
    if (formData.auto_calculate_distance && 
        formData.latitude && 
        formData.longitude && 
        formData.university &&
        window.google) {
      calculateDistance(formData.latitude, formData.longitude, formData.university);
    }
  }, [formData.latitude, formData.longitude, formData.university, formData.auto_calculate_distance]);

  const addRoomType = () => {
    const newRoomType: RoomType = {
      id: Date.now().toString(),
      gender: 'male',
      capacity: 2,
      room_count: 1,
      price_per_bed: '',
      amenities: []
    };
    setFormData(prev => ({
      ...prev,
      roomTypes: [...prev.roomTypes, newRoomType]
    }));
  };

  const removeRoomType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.filter(room => room.id !== id)
    }));
  };

  const updateRoomType = (id: string, field: keyof RoomType, value: any) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.map(room => 
        room.id === id ? { ...room, [field]: value } : room
      )
    }));
  };

  const handleRoomAmenityChange = (roomId: string, amenityId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.map(room => 
        room.id === roomId 
          ? {
              ...room,
              amenities: checked 
                ? [...room.amenities, amenityId]
                : room.amenities.filter(a => a !== amenityId)
            }
          : room
      )
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images.",
        variant: "destructive"
      });
      return;
    }
    handleInputChange('images', [...formData.images, ...files]);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `${user?.id}/${Date.now()}_${index}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('hostel-images')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('hostel-images')
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.location || !formData.university) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.roomTypes.length === 0) {
      toast({
        title: "No Room Types",
        description: "Please add at least one room type.",
        variant: "destructive"
      });
      return false;
    }

    for (const room of formData.roomTypes) {
      if (!room.price_per_bed || parseFloat(room.price_per_bed) <= 0) {
        toast({
          title: "Invalid Price",
          description: "All room types must have a valid price per bed.",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to list your property.",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        imageUrls = await uploadImages(formData.images);
      }

      // Insert hostel data
      const { data: hostelData, error: hostelError } = await supabase
        .from('hostels')
        .insert([{
          name: formData.name,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          university: formData.university,
          walk_minutes: formData.walk_minutes ? parseInt(formData.walk_minutes) : null,
          drive_minutes: formData.drive_minutes ? parseInt(formData.drive_minutes) : null,
          description: formData.description,
          images: imageUrls,
          created_by: user.id
        }])
        .select()
        .single();

      if (hostelError) throw hostelError;

      // Insert room types
      const roomsData = formData.roomTypes.map(room => ({
        hostel_id: hostelData.id,
        gender: room.gender,
        capacity: room.capacity,
        room_count: room.room_count,
        price_per_bed: parseFloat(room.price_per_bed),
        amenities: room.amenities
      }));

      const { error: roomsError } = await supabase
        .from('rooms')
        .insert(roomsData);

      if (roomsError) throw roomsError;

      toast({
        title: "Property Listed Successfully! 🎉",
        description: "Your hostel has been added to our platform.",
      });

      // Redirect to the hostel detail page
      navigate(`/hostel/${hostelData.id}`);

    } catch (error) {
      console.error('Error listing property:', error);
      toast({
        title: "Error",
        description: "Failed to list property. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BackButton />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Building className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">List Your Property</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Add your hostel with detailed room information and location mapping.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Hostel Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Sunrise Student Lodge"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="university">Nearby University *</Label>
                    <Select
                      value={formData.university}
                      onValueChange={(value) => handleInputChange('university', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the nearest university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((uni) => (
                          <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Address/Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., East Legon, Accra"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Distance to University */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto_calculate_distance"
                      checked={formData.auto_calculate_distance}
                      onCheckedChange={(checked) => 
                        handleInputChange('auto_calculate_distance', checked as boolean)
                      }
                    />
                    <Label htmlFor="auto_calculate_distance">
                      Auto-calculate distance to university using map location
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="walk_minutes">Walking Distance (minutes)</Label>
                      <Input
                        id="walk_minutes"
                        type="number"
                        min="0"
                        value={formData.walk_minutes}
                        onChange={(e) => handleInputChange('walk_minutes', e.target.value)}
                        placeholder="e.g., 15"
                        disabled={formData.auto_calculate_distance}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="drive_minutes">Driving Distance (minutes)</Label>
                      <Input
                        id="drive_minutes"
                        type="number"
                        min="0"
                        value={formData.drive_minutes}
                        onChange={(e) => handleInputChange('drive_minutes', e.target.value)}
                        placeholder="e.g., 5"
                        disabled={formData.auto_calculate_distance}
                      />
                    </div>
                  </div>

                  {formData.auto_calculate_distance && (!formData.latitude || !formData.longitude) && (
                    <p className="text-sm text-muted-foreground">
                      📍 Set the hostel location on the map below to auto-calculate distances.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your hostel, what makes it special, nearby amenities..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Map Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Set Location on Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click on the map or drag the marker to set the exact location of your hostel.
                  </p>
                  <div 
                    ref={mapRef} 
                    className="w-full h-96 rounded-lg border"
                    style={{ minHeight: '400px' }}
                  />
                  {formData.latitude && formData.longitude && (
                    <div className="text-sm text-muted-foreground">
                      Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Room Types */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Room Types
                  </CardTitle>
                  <Button type="button" onClick={addRoomType} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Room Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.roomTypes.map((roomType, index) => (
                  <Card key={roomType.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Room Type {index + 1}</CardTitle>
                        {formData.roomTypes.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeRoomType(roomType.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Gender *</Label>
                          <Select
                            value={roomType.gender}
                            onValueChange={(value: 'male' | 'female' | 'mixed') => 
                              updateRoomType(roomType.id, 'gender', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Beds per Room *</Label>
                          <Select
                            value={roomType.capacity.toString()}
                            onValueChange={(value) => 
                              updateRoomType(roomType.id, 'capacity', parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6].map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} {num === 1 ? 'bed' : 'beds'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Number of Rooms *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={roomType.room_count}
                            onChange={(e) => 
                              updateRoomType(roomType.id, 'room_count', parseInt(e.target.value) || 1)
                            }
                          />
                        </div>

                        <div>
                          <Label>Price per Bed (₵) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={roomType.price_per_bed}
                            onChange={(e) => 
                              updateRoomType(roomType.id, 'price_per_bed', e.target.value)
                            }
                            placeholder="e.g., 800.00"
                          />
                        </div>
                      </div>

                      {/* Room Amenities */}
                      <div>
                        <Label className="mb-3 block">Room Amenities</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {availableAmenities.map((amenity) => (
                            <div key={amenity.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${roomType.id}-${amenity.id}`}
                                checked={roomType.amenities.includes(amenity.id)}
                                onCheckedChange={(checked) => 
                                  handleRoomAmenityChange(roomType.id, amenity.id, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`${roomType.id}-${amenity.id}`} 
                                className="text-sm flex items-center gap-2 cursor-pointer"
                              >
                                {amenity.icon}
                                {amenity.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Room Summary */}
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Room Summary</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            {roomType.room_count} {roomType.gender} {roomType.room_count === 1 ? 'room' : 'rooms'} 
                            with {roomType.capacity} {roomType.capacity === 1 ? 'bed' : 'beds'} each
                          </p>
                          <p>
                            Total beds: {roomType.room_count * roomType.capacity}
                          </p>
                          {roomType.price_per_bed && (
                            <p>
                              Revenue potential: ₵{(parseFloat(roomType.price_per_bed) * roomType.room_count * roomType.capacity).toLocaleString()} per billing period
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Images (Max 10)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="images"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload images or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 10MB each
                      </p>
                    </div>
                  </Label>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
                size="lg"
              >
                {loading ? "Listing Property..." : "List Property"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvancedListProperty;

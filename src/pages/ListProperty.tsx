import { useState } from 'react';
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
import { Building, MapPin, Users, DollarSign, Upload, ArrowLeft, Wifi, Car, Utensils, Shirt, Shield, Zap, Dumbbell, BookOpen, Coffee, Tv } from 'lucide-react';

interface FormData {
  name: string;
  location: string;
  university: string;
  male_rooms: string;
  female_rooms: string;
  beds_per_room: string;
  price_per_bed: string;
  duration_type: string;
  facilities: string[];
  description: string;
  images: File[];
}

const ListProperty = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    university: '',
    male_rooms: '',
    female_rooms: '',
    beds_per_room: '1',
    price_per_bed: '',
    duration_type: '',
    facilities: [],
    description: '',
    images: []
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

  const availableFacilities = [
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
    { id: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" /> },
    { id: 'kitchen', label: 'Kitchen', icon: <Utensils className="h-4 w-4" /> },
    { id: 'laundry', label: 'Laundry', icon: <Shirt className="h-4 w-4" /> },
    { id: 'security', label: '24/7 Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'generator', label: 'Backup Generator', icon: <Zap className="h-4 w-4" /> },
    { id: 'gym', label: 'Gym/Fitness', icon: <Dumbbell className="h-4 w-4" /> },
    { id: 'study_room', label: 'Study Room', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'common_room', label: 'Common Room', icon: <Coffee className="h-4 w-4" /> },
    { id: 'tv_room', label: 'TV Room', icon: <Tv className="h-4 w-4" /> }
  ];

  const handleInputChange = (field: keyof FormData, value: string | string[] | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFacilityChange = (facilityId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      facilities: checked 
        ? [...prev.facilities, facilityId]
        : prev.facilities.filter(f => f !== facilityId)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images.",
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
    const requiredFields = ['name', 'location', 'university', 'price_per_bed', 'duration_type'];
    const emptyFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (emptyFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return false;
    }

    const maleRooms = parseInt(formData.male_rooms) || 0;
    const femaleRooms = parseInt(formData.female_rooms) || 0;
    
    if (maleRooms + femaleRooms === 0) {
      toast({
        title: "Invalid Room Count",
        description: "You must have at least one room (male or female).",
        variant: "destructive"
      });
      return false;
    }

    const price = parseFloat(formData.price_per_bed);
    if (price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price per bed must be greater than 0.",
        variant: "destructive"
      });
      return false;
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
      const totalRooms = (parseInt(formData.male_rooms) || 0) + (parseInt(formData.female_rooms) || 0);
      const availableRooms = totalRooms; // Initially all rooms are available
      
      const { data: hostelData, error } = await supabase
        .from('hostels')
        .insert([{
          name: formData.name,
          address: formData.location,
          city: formData.location.split(',')[0]?.trim() || formData.location,
          region: formData.location.split(',')[1]?.trim() || 'Greater Accra',
          description: formData.description,
          hostel_type: 'mixed' as const, // Default to mixed since we have both male and female rooms
          price_per_semester: parseFloat(formData.price_per_bed) * 
            (formData.duration_type === 'semester' ? 1 : 
             formData.duration_type === 'academic_year' ? 2 : 1),
          price_per_academic_year: parseFloat(formData.price_per_bed) * 
            (formData.duration_type === 'academic_year' ? 1 : 
             formData.duration_type === 'semester' ? 2 : 2),
          total_rooms: totalRooms,
          available_rooms: availableRooms,
          amenities: formData.facilities,
          images: imageUrls,
          landlord_id: user.id,
          is_active: true,
          is_verified: false // Will need admin verification
        }])
        .select()
        .single();

      if (error) throw error;

      // Create individual rooms for the hostel
      const roomsToCreate = [];
      const maleRooms = parseInt(formData.male_rooms) || 0;
      const femaleRooms = parseInt(formData.female_rooms) || 0;
      const bedsPerRoom = parseInt(formData.beds_per_room);
      const pricePerBed = parseFloat(formData.price_per_bed);
      
      // Create male rooms
      for (let i = 1; i <= maleRooms; i++) {
        roomsToCreate.push({
          hostel_id: hostelData.id,
          room_number: `M${i.toString().padStart(2, '0')}`,
          room_type: 'male' as const,
          capacity: bedsPerRoom,
          price_per_semester: pricePerBed * (formData.duration_type === 'semester' ? 1 : 
                                           formData.duration_type === 'academic_year' ? 2 : 1),
          price_per_academic_year: pricePerBed * (formData.duration_type === 'academic_year' ? 1 : 
                                                formData.duration_type === 'semester' ? 2 : 2),
          is_available: true,
          occupied: 0,
          amenities: formData.facilities
        });
      }
      
      // Create female rooms
      for (let i = 1; i <= femaleRooms; i++) {
        roomsToCreate.push({
          hostel_id: hostelData.id,
          room_number: `F${i.toString().padStart(2, '0')}`,
          room_type: 'female' as const,
          capacity: bedsPerRoom,
          price_per_semester: pricePerBed * (formData.duration_type === 'semester' ? 1 : 
                                           formData.duration_type === 'academic_year' ? 2 : 1),
          price_per_academic_year: pricePerBed * (formData.duration_type === 'academic_year' ? 1 : 
                                                formData.duration_type === 'semester' ? 2 : 2),
          is_available: true,
          occupied: 0,
          amenities: formData.facilities
        });
      }
      
      // Insert all rooms
      if (roomsToCreate.length > 0) {
        const { error: roomsError } = await supabase
          .from('rooms')
          .insert(roomsToCreate);
        
        if (roomsError) {
          console.error('Error creating rooms:', roomsError);
          // Don't throw here, hostel was created successfully
        }
      }

      toast({
        title: "Property Listed Successfully! 🎉",
        description: `Your hostel has been added with ${totalRooms} rooms.`,
      });

      // Redirect to the hostel detail page
      navigate(`/hostel/${hostelData.id}`);

    } catch (error) {
      console.error('Error listing property:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to list property: ${errorMessage}. Please try again.`,
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Building className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">List Your Property</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Add your hostel to our platform and connect with students looking for accommodation.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
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
                      <Label htmlFor="location">Location *</Label>
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
                </div>

                {/* Room Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Room Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="male_rooms">Number of Male Rooms</Label>
                      <Input
                        id="male_rooms"
                        type="number"
                        min="0"
                        value={formData.male_rooms}
                        onChange={(e) => handleInputChange('male_rooms', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="female_rooms">Number of Female Rooms</Label>
                      <Input
                        id="female_rooms"
                        type="number"
                        min="0"
                        value={formData.female_rooms}
                        onChange={(e) => handleInputChange('female_rooms', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="beds_per_room">Beds per Room *</Label>
                      <Input
                        id="beds_per_room"
                        type="number"
                        min="1"
                        value={formData.beds_per_room}
                        onChange={(e) => handleInputChange('beds_per_room', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="price_per_bed">Price per Bed (₵) *</Label>
                      <Input
                        id="price_per_bed"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price_per_bed}
                        onChange={(e) => handleInputChange('price_per_bed', e.target.value)}
                        placeholder="e.g., 800.00"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration_type">Duration Type *</Label>
                      <Select
                        value={formData.duration_type}
                        onValueChange={(value) => handleInputChange('duration_type', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semester">Per Semester</SelectItem>
                          <SelectItem value="year">Per Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Facilities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {availableFacilities.map((facility) => (
                      <div key={facility.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={facility.id}
                          checked={formData.facilities.includes(facility.id)}
                          onCheckedChange={(checked) => 
                            handleFacilityChange(facility.id, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={facility.id} 
                          className="text-sm flex items-center gap-2 cursor-pointer"
                        >
                          {facility.icon}
                          {facility.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Images (Max 5)
                  </h3>
                  
                  <div className="space-y-4">
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
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListProperty;

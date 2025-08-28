import Navigation from "@/components/Navigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building, Users, TrendingUp, Shield, CheckCircle, ArrowRight, Upload, MapPin, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function Landlords() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    region: '',
    hostel_type: '',
    price_per_semester: '',
    total_rooms: '',
    available_rooms: '',
    amenities: [] as string[],
    contact_phone: '',
    contact_email: '',
    images: [] as string[]
  });

  const regions = [
    'Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Northern', 
    'Upper East', 'Upper West', 'Volta', 'Western', 'Brong Ahafo'
  ];

  const availableAmenities = [
    'WiFi', 'Air Conditioning', 'Kitchen', 'Laundry', 'Parking', 
    'Security', 'Study Room', 'Recreation Area', 'Water Supply', 
    'Backup Generator', 'CCTV', 'Fire Safety'
  ];

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

    if (profile?.user_type !== 'landlord') {
      toast({
        title: "Access Denied",
        description: "Only landlords can list properties. Please create a landlord account.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('hostels')
        .insert([{
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          region: formData.region,
          hostel_type: formData.hostel_type as 'male' | 'female' | 'mixed',
          price_per_semester: parseInt(formData.price_per_semester),
          total_rooms: parseInt(formData.total_rooms),
          available_rooms: parseInt(formData.available_rooms),
          amenities: formData.amenities,
          images: formData.images,
          landlord_id: user.id,
          is_active: false, // Requires admin approval
          is_verified: false,
          rating: 0,
          total_reviews: 0
        }]);

      if (error) throw error;

      toast({
        title: "Property Listed Successfully! 🎉",
        description: "Your property has been submitted for review. We'll notify you once it's approved.",
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        city: '',
        region: '',
        hostel_type: '',
        price_per_semester: '',
        total_rooms: '',
        available_rooms: '',
        amenities: [],
        contact_phone: '',
        contact_email: '',
        images: []
      });
      setShowForm(false);

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

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const features = [
    {
      icon: <Building className="h-6 w-6" />,
      title: "Easy Property Management",
      description: "List and manage your hostels with our intuitive dashboard"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Quality Students",
      description: "Connect with verified university students across Ghana"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Increase Bookings",
      description: "Reach more students and maximize your occupancy rates"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Get paid securely with our integrated payment system"
    }
  ];

  const benefits = [
    "Zero commission on first 10 bookings",
    "24/7 customer support",
    "Marketing support and promotion",
    "Mobile app for property management",
    "Instant booking notifications",
    "Automated payment collection"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              List Your Hostel on HostelPadi
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Connect with thousands of university students looking for quality accommodation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-4"
                onClick={() => setShowForm(true)}
              >
                List Your Property
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Property Listing Form */}
      {showForm && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-6 w-6" />
                    List Your Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <Label htmlFor="hostel_type">Hostel Type *</Label>
                          <Select
                            value={formData.hostel_type}
                            onValueChange={(value) => handleInputChange('hostel_type', value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male Only</SelectItem>
                              <SelectItem value="female">Female Only</SelectItem>
                              <SelectItem value="mixed">Mixed Gender</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe your hostel, facilities, and what makes it special..."
                          rows={4}
                          required
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Location
                      </h3>
                      
                      <div>
                        <Label htmlFor="address">Full Address *</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="e.g., 123 University Road, Near UG Campus"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="e.g., Accra"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="region">Region *</Label>
                          <Select
                            value={formData.region}
                            onValueChange={(value) => handleInputChange('region', value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map((region) => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Capacity */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pricing & Capacity
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="price_per_semester">Price per Semester (₵) *</Label>
                          <Input
                            id="price_per_semester"
                            type="number"
                            value={formData.price_per_semester}
                            onChange={(e) => handleInputChange('price_per_semester', e.target.value)}
                            placeholder="e.g., 1500"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="total_rooms">Total Rooms *</Label>
                          <Input
                            id="total_rooms"
                            type="number"
                            value={formData.total_rooms}
                            onChange={(e) => handleInputChange('total_rooms', e.target.value)}
                            placeholder="e.g., 50"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="available_rooms">Available Rooms *</Label>
                          <Input
                            id="available_rooms"
                            type="number"
                            value={formData.available_rooms}
                            onChange={(e) => handleInputChange('available_rooms', e.target.value)}
                            placeholder="e.g., 25"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {availableAmenities.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={amenity}
                              checked={formData.amenities.includes(amenity)}
                              onCheckedChange={(checked) => 
                                handleAmenityChange(amenity, checked as boolean)
                              }
                            />
                            <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Contact Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact_phone">Contact Phone *</Label>
                          <Input
                            id="contact_phone"
                            value={formData.contact_phone}
                            onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                            placeholder="e.g., +233 XXX XXX XXX"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="contact_email">Contact Email *</Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => handleInputChange('contact_email', e.target.value)}
                            placeholder="e.g., contact@hostel.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? "Submitting..." : "Submit for Review"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose HostelPadi?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of property owners who trust HostelPadi to manage their student accommodations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 bg-gradient-card hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We provide all the tools and support you need to manage your property and maximize your revenue.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="mt-8" variant="ghana">
                Get Started Today
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <img
                src="/placeholder.svg"
                alt="Property management dashboard"
                className="rounded-lg shadow-strong"
              />
              <div className="absolute -top-4 -right-4 bg-success text-white px-4 py-2 rounded-full font-semibold">
                Free Setup!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Listed Properties</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Occupancy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">8+</div>
              <div className="text-muted-foreground">Universities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to List Your Property?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join HostelPadi today and start earning more from your student accommodation
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-4"
            onClick={() => setShowForm(true)}
          >
            List Your Hostel Now
          </Button>
        </div>
      </section>
    </div>
  );
}
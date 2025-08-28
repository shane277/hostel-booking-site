import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Bell, X } from "lucide-react";
import HostelCard from "./HostelCard";

interface Hostel {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  rating: number;
  total_reviews: number;
  price_per_semester: number;
  images: string[];
  amenities: string[];
  available_rooms: number;
}

const PopularHostels = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [alertData, setAlertData] = useState({
    location: '',
    max_price: '',
    hostel_type: '',
    email: user?.email || ''
  });

  useEffect(() => {
    fetchPopularHostels();
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPriceAlert) {
        setShowPriceAlert(false);
      }
    };

    if (showPriceAlert) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showPriceAlert]);

  const fetchPopularHostels = async () => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('rating', { ascending: false })
        .order('total_reviews', { ascending: false })
        .limit(4);

      if (error) throw error;
      setHostels(data || []);
    } catch (error) {
      console.error('Error fetching popular hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to set up price alerts.",
        variant: "destructive"
      });
      return;
    }

    if (!alertData.location || !alertData.max_price) {
      toast({
        title: "Missing Information",
        description: "Please fill in location and maximum price.",
        variant: "destructive"
      });
      return;
    }

    const price = parseFloat(alertData.max_price);
    if (price <= 0 || isNaN(price)) {
      toast({
        title: "Invalid Price",
        description: "Maximum price must be a valid number greater than 0.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Try database first, then fallback to localStorage
      try {
        const { data, error } = await supabase
          .from('price_alerts')
          .insert([{
            user_id: user.id,
            university: alertData.location,
            max_price: price
          }])
          .select();

        if (error) {
          throw error;
        }
        toast({
          title: "Price Alert Set! 🔔",
          description: "We'll notify you when hostels matching your criteria become available.",
        });

      } catch (dbError) {
        // Fallback to localStorage
        const existingAlerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        const newAlert = {
          id: `local_${Date.now()}`,
          user_id: user.id,
          university: alertData.location,
          max_price: price,
          created_at: new Date().toISOString()
        };
        
        existingAlerts.push(newAlert);
        localStorage.setItem('priceAlerts', JSON.stringify(existingAlerts));

        toast({
          title: "Price Alert Set! 🔔",
          description: "Alert saved locally. We'll notify you when hostels matching your criteria become available.",
        });
      }

      setShowPriceAlert(false);
      setAlertData({
        location: '',
        max_price: '',
        hostel_type: '',
        email: user?.email || ''
      });

    } catch (error) {
      console.error('Unexpected error setting price alert:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to set price alert: ${errorMessage}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Popular Hostels This Month
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Most booked hostels by students across Ghana's top universities
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
                <div className="h-48 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hostels.map((hostel) => (
              <HostelCard 
                key={hostel.id} 
                id={hostel.id}
                name={hostel.name}
                location={`${hostel.address}, ${hostel.city}`}
                distance="1.2km" // TODO: Calculate actual distance
                rating={hostel.rating}
                reviewCount={hostel.total_reviews}
                price={hostel.price_per_semester}
                images={hostel.images}
                amenities={hostel.amenities}
                beds={hostel.available_rooms}
                isVerified={true}
                isFavorite={false}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/search">
                View All Hostels →
              </Link>
            </Button>
            <span className="text-muted-foreground">or</span>
            <Button 
              variant="outline"
              onClick={() => setShowPriceAlert(true)}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Quick Price Alert
            </Button>
          </div>
        </div>

        {/* Price Alert Modal */}
        {showPriceAlert && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPriceAlert(false);
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="price-alert-title"
          >
            <Card className="w-full max-w-md bg-white shadow-2xl border-2 border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle id="price-alert-title" className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Quick Price Alert
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPriceAlert(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePriceAlertSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="alert-location">Location/University</Label>
                    <Input
                      id="alert-location"
                      value={alertData.location}
                      onChange={(e) => setAlertData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., University of Ghana"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="alert-price">Maximum Price (₵)</Label>
                    <Input
                      id="alert-price"
                      type="number"
                      value={alertData.max_price}
                      onChange={(e) => setAlertData(prev => ({ ...prev, max_price: e.target.value }))}
                      placeholder="e.g., 1500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="alert-type">Hostel Type (Optional)</Label>
                    <Select
                      value={alertData.hostel_type}
                      onValueChange={(value) => setAlertData(prev => ({ ...prev, hostel_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any type</SelectItem>
                        <SelectItem value="male">Male Only</SelectItem>
                        <SelectItem value="female">Female Only</SelectItem>
                        <SelectItem value="mixed">Mixed Gender</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="alert-email">Email for Notifications</Label>
                    <Input
                      id="alert-email"
                      type="email"
                      value={alertData.email}
                      onChange={(e) => setAlertData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Set Alert
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowPriceAlert(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularHostels;
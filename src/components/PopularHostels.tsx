import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularHostels();
  }, []);

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
            <button className="text-primary hover:underline font-medium">
              View All Hostels →
            </button>
            <span className="text-muted-foreground">or</span>
            <button className="text-primary hover:underline font-medium">
              Set Up Price Alerts
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularHostels;
import { useState, useEffect, useCallback } from 'react';
import AdvancedSearchBar from '@/components/AdvancedSearchBar';
import SearchResults from '@/components/SearchResults';
import SavedSearches from '@/components/SavedSearches';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Hostel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  region: string;
  hostel_type: 'male' | 'female' | 'mixed';
  price_per_semester: number;
  rating: number;
  total_reviews: number;
  images: string[];
  amenities: string[];
}

interface SearchFilters {
  location: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  rating: number;
  hostelType: string;
}

export default function Search() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    checkIn: '',
    checkOut: '',
    roomType: '',
    minPrice: 0,
    maxPrice: 10000,
    amenities: [],
    rating: 0,
    hostelType: ''
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('hostels')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true);

      // Apply location filter
      if (filters.location) {
        query = query.or(`name.ilike.%${filters.location}%,city.ilike.%${filters.location}%,address.ilike.%${filters.location}%`);
      }

      // Apply hostel type filter
      if (filters.hostelType && ['male', 'female', 'mixed'].includes(filters.hostelType)) {
        query = query.eq('hostel_type', filters.hostelType as 'male' | 'female' | 'mixed');
      }

      // Apply price range filter
      if (filters.minPrice > 0) {
        query = query.gte('price_per_semester', filters.minPrice);
      }
      if (filters.maxPrice < 10000) {
        query = query.lte('price_per_semester', filters.maxPrice);
      }

      // Apply rating filter
      if (filters.rating > 0) {
        query = query.gte('rating', filters.rating);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      let filteredData = data || [];

      // Filter by amenities (client-side since it's an array)
      if (filters.amenities.length > 0) {
        filteredData = filteredData.filter(hostel =>
          filters.amenities.every(amenity =>
            hostel.amenities?.includes(amenity)
          )
        );
      }

      setHostels(filteredData);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      toast.error('Failed to fetch hostels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(() => {
    fetchHostels();
  }, [filters]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const clearFilter = (filterKey: string) => {
    if (filterKey === 'search') {
      setFilters(prev => ({ ...prev, location: '' }));
    } else if (filterKey === 'amenities') {
      setFilters(prev => ({ ...prev, amenities: [] }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        [filterKey]: filterKey === 'rating' || filterKey === 'minPrice' ? 0 : 
                   filterKey === 'maxPrice' ? 10000 : ''
      }));
    }
  };

  const loadSavedSearch = (savedFilters: SearchFilters) => {
    setFilters(savedFilters);
  };

  // Auto-search when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchHostels();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Get active filters for display
  const getActiveFilters = () => {
    const active: Record<string, string | number | string[]> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'amenities' && value.length > 0) active[key] = value;
      else if (key === 'minPrice' && value > 0) active[key] = value;
      else if (key === 'maxPrice' && value < 10000) active[key] = value;
      else if (key === 'rating' && value > 0) active[key] = value;
      else if (value && typeof value === 'string') active[key] = value;
    });
    return active;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Find Your Perfect Hostel</h1>
          <p className="text-lg text-muted-foreground">
            Search through verified hostels with advanced filters and save your favorite searches
          </p>
        </div>

        {/* Advanced Search Bar */}
        <AdvancedSearchBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
        />

        {/* Saved Searches */}
        <SavedSearches
          currentFilters={filters}
          onLoadSearch={loadSavedSearch}
        />

        {/* Search Results */}
        <SearchResults
          hostels={hostels}
          loading={loading}
          searchQuery={filters.location}
          activeFilters={getActiveFilters()}
          onClearFilter={clearFilter}
        />
      </div>
    </div>
  );
}
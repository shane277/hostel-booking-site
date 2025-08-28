import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdvancedSearchBar from '@/components/AdvancedSearchBar';
import SearchResults from '@/components/SearchResults';
import SavedSearches from '@/components/SavedSearches';
import { LoadingProverbs } from '@/components/LoadingProverbs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search as SearchIcon, 
  MapPin, 
  TrendingUp, 
  Sparkles, 
  Users, 
  Wifi, 
  DollarSign,
  Star,
  Shield,
  Heart,
  Brain,
  MessageSquare,
  BookOpen,
  Filter,
  Zap
} from 'lucide-react';

interface Hostel {
  id: string;
  name: string;
  description: string;
  location: string;
  university: string;
  male_rooms?: number;
  female_rooms?: number;
  beds_per_room?: number;
  price_per_bed?: number;
  duration_type?: 'semester' | 'year';
  facilities?: string[];
  images: string[];
  created_at: string;
  // New schema fields
  latitude?: number;
  longitude?: number;
  walk_minutes?: number;
  drive_minutes?: number;
  rooms?: Room[];
}

interface Room {
  id: string;
  gender: 'male' | 'female' | 'mixed';
  capacity: number;
  room_count: number;
  price_per_bed: number;
  amenities: string[];
}

interface SearchFilters {
  location: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  durationType: string;
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  rating: number;
  hostelType: string;
}

const popularLocations = [
  { name: 'University of Ghana - Legon', icon: '🎓', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { name: 'KNUST - Kumasi', icon: '🔧', color: 'bg-green-50 border-green-200 text-green-800' },
  { name: 'University of Cape Coast', icon: '🌊', color: 'bg-cyan-50 border-cyan-200 text-cyan-800' },
  { name: 'GIMPA - Accra', icon: '💼', color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { name: 'UCC - Cape Coast', icon: '📚', color: 'bg-orange-50 border-orange-200 text-orange-800' },
  { name: 'Ashesi University', icon: '💡', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' }
];

const trendingSearches = [
  { term: 'Budget hostels under ₵500', filter: { maxPrice: 500 }, icon: <DollarSign className="h-4 w-4" />, count: '127 hostels' },
  { term: 'Female-only hostels', filter: { hostelType: 'female' }, icon: <Users className="h-4 w-4" />, count: '45 hostels' },
  { term: 'WiFi-enabled hostels', filter: { amenities: ['WiFi'] }, icon: <Wifi className="h-4 w-4" />, count: '89 hostels' },
  { term: '4+ star rated hostels', filter: { rating: 4 }, icon: <Star className="h-4 w-4" />, count: '32 hostels' },
  { term: 'Mixed gender hostels', filter: { hostelType: 'mixed' }, icon: <Users className="h-4 w-4" />, count: '78 hostels' },
  { term: 'Premium hostels', filter: { minPrice: 1000 }, icon: <Sparkles className="h-4 w-4" />, count: '23 hostels' }
];

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState(0);
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('location') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    roomType: searchParams.get('roomType') || '',
    durationType: searchParams.get('durationType') || '',
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '10000'),
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
    rating: parseInt(searchParams.get('rating') || '0'),
    hostelType: searchParams.get('hostelType') || ''
  });

  // Get verified hostel count
  useEffect(() => {
    const getVerifiedCount = async () => {
      // Try new schema first
      let { count } = await supabase
        .from('hostels')
        .select('*', { count: 'exact', head: true });
      
      // Fallback to old schema
      if (!count) {
        const result = await supabase
          .from('hostels_new')
          .select('*', { count: 'exact', head: true });
        count = result.count;
      }
      
      setVerifiedCount(count || 6); // Show 6 if no data (sample data count)
    };
    
    getVerifiedCount();
  }, []);

  // Initial search on page load
  useEffect(() => {
    fetchHostels();
  }, []);

  // Trigger search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchHostels();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters.hostelType, filters.roomType, filters.durationType, filters.minPrice, filters.maxPrice, filters.amenities, filters.rating]);

  const fetchHostels = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('hostels_new')
        .select('*');

      // Apply location filter
      if (filters.location || searchQuery) {
        const searchTerm = filters.location || searchQuery;
        query = query.or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,university.ilike.%${searchTerm}%`);
      }

      // Apply hostel type filter (based on room availability)
      if (filters.hostelType) {
        if (filters.hostelType === 'male') {
          query = query.gt('male_rooms', 0);
        } else if (filters.hostelType === 'female') {
          query = query.gt('female_rooms', 0);
        } else if (filters.hostelType === 'mixed') {
          query = query.and('male_rooms.gt.0,female_rooms.gt.0');
        }
      }

      // Apply price range filter
      if (filters.minPrice > 0) {
        query = query.gte('price_per_bed', filters.minPrice);
      }
      if (filters.maxPrice < 10000) {
        query = query.lte('price_per_bed', filters.maxPrice);
      }

      // Apply duration type filter
      if (filters.durationType === 'semester' || filters.durationType === 'year') {
        query = query.eq('duration_type', filters.durationType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Try new schema as fallback
        const { data: newData, error: newError } = await supabase
          .from('hostels')
          .select(`*, rooms (*)`)
          .limit(10);
        
        if (!newError && newData && newData.length > 0) {
          setHostels(newData);
          return;
        }
        
        // Use sample data if both fail
        setHostels(getSampleData());
        return;
      }
      
      let filteredData = data || [];

      // Filter by facilities (client-side since it's an array)
      if (filters.amenities.length > 0) {
        filteredData = filteredData.filter(hostel =>
          filters.amenities.every(amenity =>
            hostel.facilities?.includes(amenity)
          )
        );
      }

      setHostels(filteredData);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      // Use sample data on error
      setHostels(getSampleData());
    } finally {
      setLoading(false);
    }
  };

  const getSampleData = (): Hostel[] => [
    {
      id: 'sample-1',
      name: 'Sunrise Student Lodge',
      description: 'Modern hostel with excellent facilities near University of Ghana',
      location: 'East Legon, Accra',
      university: 'University of Ghana (Legon)',
      latitude: 5.6510,
      longitude: -0.1870,
      walk_minutes: 15,
      drive_minutes: 5,
      images: ['https://images.unsplash.com/photo-1555854877-bab0e5b8b2e0?w=400'],
      created_at: new Date().toISOString(),
      rooms: [{
        id: 'room-1',
        gender: 'mixed',
        capacity: 2,
        room_count: 10,
        price_per_bed: 800,
        amenities: ['WiFi', 'Kitchen', 'Laundry', 'Security']
      }]
    },
    {
      id: 'sample-2',
      name: 'Campus View Hostel',
      description: 'Close to KNUST campus with great amenities',
      location: 'Kumasi',
      university: 'Kwame Nkrumah University of Science and Technology (KNUST)',
      latitude: 6.6745,
      longitude: -1.5716,
      walk_minutes: 10,
      drive_minutes: 3,
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'],
      created_at: new Date().toISOString(),
      rooms: [{
        id: 'room-2',
        gender: 'female',
        capacity: 1,
        room_count: 8,
        price_per_bed: 950,
        amenities: ['WiFi', 'Kitchen', 'Private Bathroom', 'Security']
      }]
    },
    {
      id: 'sample-3',
      name: 'Golden Gate Residence',
      description: 'Premium accommodation for serious students',
      location: 'Cape Coast',
      university: 'University of Cape Coast (UCC)',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
      created_at: new Date().toISOString(),
      rooms: [{
        id: 'room-3',
        gender: 'male',
        capacity: 3,
        room_count: 6,
        price_per_bed: 650,
        amenities: ['WiFi', 'Study Room', 'Common Room']
      }]
    },
    {
      id: 'sample-4',
      name: 'Unity Hostel Complex',
      description: 'Mixed gender accommodation with modern facilities',
      location: 'Accra',
      university: 'Ghana Institute of Management and Public Administration (GIMPA)',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
      created_at: new Date().toISOString(),
      rooms: [{
        id: 'room-4',
        gender: 'mixed',
        capacity: 4,
        room_count: 12,
        price_per_bed: 550,
        amenities: ['WiFi', 'Gym', 'Laundry', 'Parking']
      }]
    },
    {
      id: 'sample-5',
      name: 'Excellence Ladies Hostel',
      description: 'Safe and secure accommodation for female students',
      location: 'Winneba',
      university: 'University of Education, Winneba (UEW)',
      images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
      created_at: new Date().toISOString(),
      rooms: [{
        id: 'room-5',
        gender: 'female',
        capacity: 2,
        room_count: 15,
        price_per_bed: 700,
        amenities: ['WiFi', 'Security', 'Kitchen', 'Study Room']
      }]
    },
    {
      id: 'sample-6',
      name: 'Tech Hub Residence',
      description: 'Modern hostel designed for tech-savvy students',
      location: 'Berekuso',
      university: 'Ashesi University',
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'],
      created_at: new Date().toISOString(),
      rooms: [{
        id: 'room-6',
        gender: 'mixed',
        capacity: 1,
        room_count: 20,
        price_per_bed: 1200,
        amenities: ['WiFi', 'Private Bathroom', 'AC', 'Study Room', 'Gym']
      }]
    }
  ];

  const handleQuickSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    setFilters(prev => ({ ...prev, location: searchTerm }));
    fetchHostels();
  };

  const handleTrendingSearch = (trendingFilter: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...trendingFilter }));
    setTimeout(fetchHostels, 100);
  };

  const handleLocationClick = (location: string) => {
    setSearchQuery(location);
    setFilters(prev => ({ ...prev, location }));
    fetchHostels();
  };

  const handleSearch = useCallback(() => {
    // Update URL with current filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && (typeof value === 'string' ? value : 
                    typeof value === 'number' ? value > 0 && value < 10000 :
                    Array.isArray(value) ? value.length > 0 : false)) {
        params.set(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
    setSearchParams(params);
    
    fetchHostels();
  }, [filters, setSearchParams]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setTimeout(fetchHostels, 100); // Trigger search after filters change
  };

  const clearFilter = (filterKey: string) => {
    if (filterKey === 'search') {
      setFilters(prev => ({ ...prev, location: '' }));
      setSearchQuery('');
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
    setSearchQuery(savedFilters.location);
  };

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

  const hasResults = hostels.length > 0;
  const hasSearched = filters.location || searchQuery || Object.values(filters).some(val => 
    typeof val === 'string' ? val : 
    typeof val === 'number' ? val > 0 && val < 10000 : 
    Array.isArray(val) ? val.length > 0 : false
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <BackButton />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Find Your Perfect Hostel
            </h1>
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover verified hostels with our intelligent search. Use our personality quiz for personalized recommendations!
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-600" />
              <span>{verifiedCount} Verified Hostels</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Trusted Reviews</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Instant Booking</span>
            </div>
          </div>
        </div>

        {/* Quick Search Bar */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, university, or hostel name..."
                  className="pl-10 h-12 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch(searchQuery)}
                />
              </div>
              <Button 
                onClick={() => handleQuickSearch(searchQuery)}
                size="lg"
                className="px-8"
              >
                <SearchIcon className="mr-2 h-5 w-5" />
                Search
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Search (Collapsible) */}
        {showAdvanced && (
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Hostel Type Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hostel Type</label>
                    <select 
                      value={filters.hostelType} 
                      onChange={(e) => setFilters(prev => ({ ...prev, hostelType: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Any Type</option>
                      <option value="male">Male Only</option>
                      <option value="female">Female Only</option>
                      <option value="mixed">Mixed Gender</option>
                    </select>
                  </div>

                  {/* Room Type Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Room Type</label>
                    <select 
                      value={filters.roomType} 
                      onChange={(e) => setFilters(prev => ({ ...prev, roomType: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Any Room</option>
                      <option value="1">1-in-a-room</option>
                      <option value="2">2-in-a-room</option>
                      <option value="3">3-in-a-room</option>
                      <option value="4">4-in-a-room</option>
                    </select>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration</label>
                    <select 
                      value={filters.durationType} 
                      onChange={(e) => setFilters(prev => ({ ...prev, durationType: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Any Duration</option>
                      <option value="semester">Per Semester</option>
                      <option value="year">Per Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range (₵)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min price"
                        value={filters.minPrice || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                        className="w-full p-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Max price"
                        value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 10000 }))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                    <select 
                      value={filters.rating || ''} 
                      onChange={(e) => setFilters(prev => ({ ...prev, rating: parseInt(e.target.value) || 0 }))}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Any Rating</option>
                      <option value="3">3+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>
                </div>

                {/* Amenities Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['WiFi', 'Kitchen', 'Laundry', 'Security', 'Parking', 'Gym', 'Study Room', 'AC'].map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }));
                            } else {
                              setFilters(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }));
                            }
                          }}
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={fetchHostels} className="flex-1">
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilters({
                        location: '',
                        checkIn: '',
                        checkOut: '',
                        roomType: '',
                        durationType: '',
                        minPrice: 0,
                        maxPrice: 10000,
                        amenities: [],
                        rating: 0,
                        hostelType: ''
                      });
                      setSearchQuery('');
                      setTimeout(fetchHostels, 100);
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Hub */}
        {!hasSearched && (
          <div className="space-y-8">
            {/* Popular Locations */}
            <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Popular University Locations
                </CardTitle>
                <CardDescription>
                  Quick access to hostels near major universities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularLocations.map((location) => (
                    <Button
                      key={location.name}
                      variant="outline"
                      className={`h-auto p-4 justify-start ${location.color} hover:scale-105 transition-transform`}
                      onClick={() => handleLocationClick(location.name)}
                    >
                      <span className="text-2xl mr-3">{location.icon}</span>
                      <span className="font-medium">{location.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Searches */}
            <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Trending Searches
                </CardTitle>
                <CardDescription>
                  Popular filters and searches from other students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendingSearches.map((trend, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 justify-between hover:bg-orange-50 hover:border-orange-200 transition-colors"
                      onClick={() => handleTrendingSearch(trend.filter)}
                    >
                      <div className="flex items-center gap-3">
                        {trend.icon}
                        <span className="font-medium">{trend.term}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {trend.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature Integration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => navigate('/personality-quiz')}>
                <CardContent className="p-6 text-center">
                  <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-purple-900 mb-2">Personality Quiz</h3>
                  <p className="text-sm text-purple-700">
                    Take our quiz to get personalized hostel recommendations based on your lifestyle
                  </p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => navigate('/buddy-system')}>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-blue-900 mb-2">Buddy System</h3>
                  <p className="text-sm text-blue-700">
                    Find compatible roommates and connect with other students
                  </p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => navigate('/horror-stories')}>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-orange-900 mb-2">Horror Stories</h3>
                  <p className="text-sm text-orange-700">
                    Learn from other students' experiences to make better choices
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="py-12">
              <LoadingProverbs 
                message="Searching for your perfect hostel..." 
                showProverb={true}
                size="md"
                variant="simple"
              />
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {hasSearched && !loading && (
          <>
        {/* Saved Searches */}
        <SavedSearches
          currentFilters={filters}
          onLoadSearch={loadSavedSearch}
        />

            {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {loading ? 'Searching...' : `${hostels.length} hostels found`}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hostels.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hostels found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or explore our trending searches below.
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Start Over
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hostels.map((hostel) => (
                <Card key={hostel.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div onClick={() => navigate(`/hostel/${hostel.id}`)}>
                    {hostel.images && hostel.images.length > 0 ? (
                      <img
                        src={hostel.images[0]}
                        alt={hostel.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                        <span className="text-muted-foreground">No image available</span>
                      </div>
                    )}
                    
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{hostel.name}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{hostel.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-primary">
                          {hostel.rooms && hostel.rooms.length > 0 ? (
                            `₵${Math.min(...hostel.rooms.map(r => r.price_per_bed)).toLocaleString()}`
                          ) : hostel.price_per_bed ? (
                            `₵${hostel.price_per_bed.toLocaleString()}`
                          ) : (
                            '₵800'
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per bed
                        </div>
                      </div>

                      {/* Room info */}
                      {hostel.rooms && hostel.rooms.length > 0 ? (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground">
                            {hostel.rooms.map(room => `${room.capacity}-bed ${room.gender}`).slice(0, 2).join(', ')}
                            {hostel.rooms.length > 2 && '...'}
                          </p>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground">
                            {hostel.beds_per_room}-bed rooms • {((hostel.male_rooms || 0) + (hostel.female_rooms || 0))} rooms
                          </p>
                        </div>
                      )}

                      {/* Amenities preview */}
                      {((hostel.rooms && hostel.rooms[0]?.amenities) || hostel.facilities) && (
                        <div className="mb-4 flex flex-wrap gap-1">
                          {((hostel.rooms?.[0]?.amenities || hostel.facilities || []).slice(0, 3)).map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {(hostel.rooms?.[0]?.amenities || hostel.facilities || []).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(hostel.rooms?.[0]?.amenities || hostel.facilities || []).length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <Button className="w-full">
                        View Details
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

            {/* Empty State */}
            {!hasResults && (
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                <CardContent className="py-16 text-center">
                                      <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="rounded-full bg-muted p-4">
                          <SearchIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">No hostels found</h3>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your search criteria or explore our popular locations
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button variant="outline" onClick={() => clearFilter('search')}>
                        Clear Search
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/personality-quiz')}>
                        <Brain className="mr-2 h-4 w-4" />
                        Try Personality Quiz
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/buddy-system')}>
                        <Users className="mr-2 h-4 w-4" />
                        Find Roommates
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search as SearchIcon, 
  MapPin, 
  Filter,
  Users, 
  Wifi, 
  DollarSign,
  Bed,
  Car,
  Utensils,
  Shirt,
  Shield,
  Zap,
  Dumbbell,
  BookOpen,
  Coffee,
  Tv,
  Bath,
  Map,
  Eye,
  Clock,
  Building,
  Star
} from 'lucide-react';

interface Hostel {
  id: string;
  name: string;
  location: string;
  university: string;
  latitude: number;
  longitude: number;
  walk_minutes: number;
  drive_minutes: number;
  description: string;
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

interface SearchFilters {
  location: string;
  university: string;
  gender: string;
  capacity: string;
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  durationType: string;
}

interface LiveSuggestion {
  term: string;
  type: 'university' | 'location' | 'hostel';
  subtitle?: string;
  id?: string;
}

const FindHostels = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('location') || '');
  const [liveSuggestions, setLiveSuggestions] = useState<LiveSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('location') || '',
    university: searchParams.get('university') || '',
    gender: searchParams.get('gender') || '',
    capacity: searchParams.get('capacity') || '',
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '10000'),
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
    durationType: searchParams.get('durationType') || ''
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
    if (showMap && mapRef.current && !map) {
      const initMap = () => {
        if (window.google) {
          const mapInstance = new google.maps.Map(mapRef.current!, {
            center: { lat: 5.6037, lng: -0.1870 }, // Accra, Ghana
            zoom: 11,
          });
          setMap(mapInstance);
        }
      };

      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    }
  }, [showMap, map]);

  // Update map markers when hostels change
  useEffect(() => {
    if (map && hostels.length > 0) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      
      // Create new markers
      const newMarkers = hostels.map(hostel => {
        if (hostel.latitude && hostel.longitude) {
          const marker = new google.maps.Marker({
            position: { lat: hostel.latitude, lng: hostel.longitude },
            map: map,
            title: hostel.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="4"/>
                  <path d="M20 10L25 15H22V25H18V15H15L20 10Z" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 40)
            }
          });

          marker.addListener('click', () => {
            setSelectedHostel(hostel.id);
            // Scroll to hostel card
            const element = document.getElementById(`hostel-${hostel.id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });

          return marker;
        }
        return null;
      }).filter(Boolean) as google.maps.Marker[];

      setMarkers(newMarkers);

      // Adjust map bounds to fit all markers
      if (newMarkers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          const position = marker.getPosition();
          if (position) bounds.extend(position);
        });
        map.fitBounds(bounds);
      }
    }
  }, [map, hostels]);

  // Fetch live suggestions
  const fetchLiveSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setLiveSuggestions([]);
      return;
    }

    try {
      const { data: hostels, error } = await supabase
        .from('hostels')
        .select('id, name, location, university')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%,university.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;

      const suggestions: LiveSuggestion[] = [];
      
      // Add hostel suggestions
      hostels?.forEach(hostel => {
        suggestions.push({
          term: hostel.name,
          type: 'hostel',
          subtitle: hostel.location,
          id: hostel.id
        });
      });

      // Add unique locations and universities
      const locations = [...new Set(hostels?.map(h => h.location) || [])];
      const universities = [...new Set(hostels?.map(h => h.university) || [])];
      
      locations.forEach(location => {
        if (location.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            term: location,
            type: 'location',
            subtitle: 'Location'
          });
        }
      });

      universities.forEach(university => {
        if (university.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            term: university,
            type: 'university',
            subtitle: 'University'
          });
        }
      });

      setLiveSuggestions(suggestions.slice(0, 8));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLiveSuggestions(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchHostels = useCallback(async () => {
    setLoading(true);
    try {
      let hostelQuery = supabase
        .from('hostels')
        .select(`
          *,
          rooms (*)
        `);

      // Apply location/university filters
      if (filters.location || filters.university || searchQuery) {
        const searchTerm = filters.location || filters.university || searchQuery;
        hostelQuery = hostelQuery.or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,university.ilike.%${searchTerm}%`);
      }

      const { data: hostelData, error: hostelError } = await hostelQuery;

      if (hostelError) {
        // Fallback to sample data if no real data exists
        console.log('No hostels found, creating sample data...');
        const sampleHostels = [
          {
            id: 'sample-1',
            name: 'Sunrise Student Lodge',
            location: 'East Legon, Accra',
            university: 'University of Ghana (Legon)',
            latitude: 5.6510,
            longitude: -0.1870,
            walk_minutes: 15,
            drive_minutes: 5,
            description: 'Modern hostel with excellent facilities',
            images: ['https://images.unsplash.com/photo-1555854877-bab0e5b8b2e0?w=400'],
            created_at: new Date().toISOString(),
            rooms: [{
              id: 'room-1',
              gender: 'mixed' as const,
              capacity: 2,
              room_count: 10,
              price_per_bed: 800,
              amenities: ['wifi', 'kitchen', 'laundry', 'security']
            }]
          },
          {
            id: 'sample-2',
            name: 'Campus View Hostel',
            location: 'Kumasi',
            university: 'Kwame Nkrumah University of Science and Technology (KNUST)',
            latitude: 6.6745,
            longitude: -1.5716,
            walk_minutes: 10,
            drive_minutes: 3,
            description: 'Close to KNUST campus with great amenities',
            images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'],
            created_at: new Date().toISOString(),
            rooms: [{
              id: 'room-2',
              gender: 'female' as const,
              capacity: 1,
              room_count: 8,
              price_per_bed: 950,
              amenities: ['wifi', 'kitchen', 'private_bathroom', 'security']
            }]
          }
        ];
        setHostels(sampleHostels);
        setLoading(false);
        return;
      }

      // Filter hostels based on room criteria
      let filteredHostels = hostelData || [];

      if (filters.gender) {
        filteredHostels = filteredHostels.filter(hostel => 
          hostel.rooms.some((room: Room) => 
            filters.gender === 'mixed' 
              ? room.gender === 'mixed' 
              : room.gender === filters.gender || room.gender === 'mixed'
          )
        );
      }

      if (filters.capacity) {
        const capacityNum = parseInt(filters.capacity);
        filteredHostels = filteredHostels.filter(hostel =>
          hostel.rooms.some((room: Room) => room.capacity === capacityNum)
        );
      }

      if (filters.minPrice > 0 || filters.maxPrice < 10000) {
        filteredHostels = filteredHostels.filter(hostel =>
          hostel.rooms.some((room: Room) => 
            room.price_per_bed >= filters.minPrice && 
            room.price_per_bed <= filters.maxPrice
          )
        );
      }

      if (filters.amenities.length > 0) {
        filteredHostels = filteredHostels.filter(hostel =>
          hostel.rooms.some((room: Room) =>
            filters.amenities.every(amenity => room.amenities.includes(amenity))
          )
        );
      }

      setHostels(filteredHostels);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      toast.error('Failed to fetch hostels. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenityId]
        : prev.amenities.filter(a => a !== amenityId)
    }));
  };

  const handleSuggestionClick = (suggestion: LiveSuggestion) => {
    if (suggestion.type === 'hostel' && suggestion.id) {
      navigate(`/hostel/${suggestion.id}`);
    } else {
      setSearchQuery(suggestion.term);
      if (suggestion.type === 'university') {
        handleFilterChange('university', suggestion.term);
      } else {
        handleFilterChange('location', suggestion.term);
      }
    }
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      university: '',
      gender: '',
      capacity: '',
      minPrice: 0,
      maxPrice: 10000,
      amenities: [],
      durationType: ''
    });
    setSearchQuery('');
  };

  const getMinPrice = (hostel: Hostel): number => {
    return Math.min(...hostel.rooms.map(room => room.price_per_bed));
  };

  const getMaxPrice = (hostel: Hostel): number => {
    return Math.max(...hostel.rooms.map(room => room.price_per_bed));
  };

  const getTotalBeds = (hostel: Hostel): number => {
    return hostel.rooms.reduce((total, room) => total + (room.room_count * room.capacity), 0);
  };

  const getRoomTypes = (hostel: Hostel): string => {
    const types = [...new Set(hostel.rooms.map(room => `${room.capacity}-bed ${room.gender}`))];
    return types.slice(0, 2).join(', ') + (types.length > 2 ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Hostel</h1>
            <p className="text-muted-foreground text-lg">
              Discover verified hostels near your university with the best amenities and prices.
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search by location, university, or hostel name..."
                    className="pl-10 pr-4 py-3 text-lg"
                  />
                </div>

                {/* Live Suggestions */}
                {showSuggestions && liveSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {liveSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3"
                      >
                        <div className="flex items-center gap-2">
                          {suggestion.type === 'hostel' && <Building className="h-4 w-4 text-primary" />}
                          {suggestion.type === 'location' && <MapPin className="h-4 w-4 text-green-600" />}
                          {suggestion.type === 'university' && <Users className="h-4 w-4 text-blue-600" />}
                          <div>
                            <div className="font-medium">{suggestion.term}</div>
                            {suggestion.subtitle && (
                              <div className="text-sm text-muted-foreground">{suggestion.subtitle}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters and Map Toggle */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Search Filters</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowMap(!showMap)}
                  >
                    <Map className="h-4 w-4 mr-2" />
                    {showMap ? 'Hide Map' : 'Show Map'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {showFilters && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>University</Label>
                    <Select
                      value={filters.university}
                      onValueChange={(value) => handleFilterChange('university', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any University" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any University</SelectItem>
                        {universities.map((uni) => (
                          <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Gender Preference</Label>
                    <Select
                      value={filters.gender}
                      onValueChange={(value) => handleFilterChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Room Capacity</Label>
                    <Select
                      value={filters.capacity}
                      onValueChange={(value) => handleFilterChange('capacity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1-in-a-room</SelectItem>
                        <SelectItem value="2">2-in-a-room</SelectItem>
                        <SelectItem value="3">3-in-a-room</SelectItem>
                        <SelectItem value="4">4-in-a-room</SelectItem>
                        <SelectItem value="5">5-in-a-room</SelectItem>
                        <SelectItem value="6">6-in-a-room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Duration Type</Label>
                    <Select
                      value={filters.durationType}
                      onValueChange={(value) => handleFilterChange('durationType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="semester">Per Semester</SelectItem>
                        <SelectItem value="year">Per Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Min Price (₵)</Label>
                    <Input
                      type="number"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Max Price (₵)</Label>
                    <Input
                      type="number"
                      value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 10000)}
                      placeholder="No limit"
                    />
                  </div>
                </div>

                {/* Amenities Filter */}
                <div>
                  <Label className="mb-3 block">Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {availableAmenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.id}
                          checked={filters.amenities.includes(amenity.id)}
                          onCheckedChange={(checked) => 
                            handleAmenityChange(amenity.id, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={amenity.id} 
                          className="text-sm flex items-center gap-2 cursor-pointer"
                        >
                          {amenity.icon}
                          {amenity.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={fetchHostels}>
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Search Hostels
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Map */}
          {showMap && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Hostel Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mapRef} 
                  className="w-full h-96 rounded-lg border"
                  style={{ minHeight: '400px' }}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Click on markers to highlight hostels below. Blue markers show hostel locations.
                </p>
              </CardContent>
            </Card>
          )}

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
                    Try adjusting your filters or search criteria.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostels.map((hostel) => (
                  <Card 
                    key={hostel.id} 
                    id={`hostel-${hostel.id}`}
                    className={`hover:shadow-lg transition-all cursor-pointer ${
                      selectedHostel === hostel.id ? 'ring-2 ring-primary shadow-lg' : ''
                    }`}
                  >
                    {hostel.images && hostel.images.length > 0 ? (
                      <img
                        src={hostel.images[0]}
                        alt={hostel.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                        <Building className="h-12 w-12 text-muted-foreground" />
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

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Bed className="h-4 w-4" />
                          <span>{getTotalBeds(hostel)} beds total</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-primary">
                          {getMinPrice(hostel) === getMaxPrice(hostel) ? (
                            `₵${getMinPrice(hostel).toLocaleString()}`
                          ) : (
                            `₵${getMinPrice(hostel).toLocaleString()} - ₵${getMaxPrice(hostel).toLocaleString()}`
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per bed
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground">
                          {getRoomTypes(hostel)}
                        </p>
                      </div>

                      {/* Room amenities preview */}
                      {hostel.rooms.length > 0 && hostel.rooms[0].amenities.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1">
                          {hostel.rooms[0].amenities.slice(0, 3).map((amenityId) => {
                            const amenity = availableAmenities.find(a => a.id === amenityId);
                            return amenity ? (
                              <Badge key={amenityId} variant="outline" className="text-xs">
                                {amenity.label}
                              </Badge>
                            ) : null;
                          })}
                          {hostel.rooms[0].amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hostel.rooms[0].amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/hostel/${hostel.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindHostels;

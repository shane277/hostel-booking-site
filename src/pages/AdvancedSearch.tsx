import { useState, useEffect, useCallback } from 'react';
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
  Map
} from 'lucide-react';

interface Hostel {
  id: string;
  name: string;
  location: string;
  university: string;
  description: string;
  images: string[];
  latitude: number;
  longitude: number;
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
}

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('location') || '',
    university: searchParams.get('university') || '',
    gender: searchParams.get('gender') || '',
    capacity: searchParams.get('capacity') || '',
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '10000'),
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || []
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

  const fetchHostels = useCallback(async () => {
    setLoading(true);
    try {
      // First try the new schema
      let hostelQuery = supabase
        .from('hostels')
        .select(`
          *,
          rooms (*)
        `);

      // Apply location/university filters
      if (filters.location || filters.university) {
        const searchTerm = filters.location || filters.university;
        hostelQuery = hostelQuery.or(`location.ilike.%${searchTerm}%,university.ilike.%${searchTerm}%`);
      }

      const { data: hostelData, error: hostelError } = await hostelQuery;

      // If new schema fails, try old schema as fallback
      if (hostelError || !hostelData || hostelData.length === 0) {
        console.log('Trying fallback to old schema...');
        const { data: oldHostelData, error: oldError } = await supabase
          .from('hostels_new')
          .select('*')
          .limit(10);
        
        if (!oldError && oldHostelData && oldHostelData.length > 0) {
          // Convert old schema to new format
          const convertedData = oldHostelData.map(hostel => ({
            ...hostel,
            walk_minutes: null,
            drive_minutes: null,
            rooms: [{
              id: `${hostel.id}-room-1`,
              gender: hostel.male_rooms > 0 && hostel.female_rooms > 0 ? 'mixed' : 
                     hostel.male_rooms > 0 ? 'male' : 'female',
              capacity: hostel.beds_per_room || 2,
              room_count: (hostel.male_rooms || 0) + (hostel.female_rooms || 0),
              price_per_bed: hostel.price_per_bed || 0,
              amenities: hostel.facilities || []
            }]
          }));
          setHostels(convertedData);
          return;
        }
        
        // If both fail, show empty state
        console.log('No data found in either schema');
        setHostels([]);
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
  }, [filters]);

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

  const clearFilters = () => {
    setFilters({
      location: '',
      university: '',
      gender: '',
      capacity: '',
      minPrice: 0,
      maxPrice: 10000,
      amenities: []
    });
  };

  const getMinPrice = (hostel: Hostel): number => {
    return Math.min(...hostel.rooms.map(room => room.price_per_bed));
  };

  const getRoomTypes = (hostel: Hostel): string => {
    const types = [...new Set(hostel.rooms.map(room => `${room.capacity}-bed ${room.gender}`))];
    return types.join(', ');
  };

  const getTotalBeds = (hostel: Hostel): number => {
    return hostel.rooms.reduce((total, room) => total + (room.room_count * room.capacity), 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Find Hostels</h1>
            <p className="text-muted-foreground text-lg">
              Discover the perfect accommodation for your university life.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Search & Filters</CardTitle>
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
                    Map View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="location"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="Search by location..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="university">University</Label>
                  <Select
                    value={filters.university}
                    onValueChange={(value) => handleFilterChange('university', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Universities</SelectItem>
                      {universities.map((uni) => (
                        <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      Search
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostels.map((hostel) => (
                  <Card key={hostel.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div 
                      onClick={() => navigate(`/hostel/${hostel.id}`)}
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
                            <span>{hostel.university}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Bed className="h-4 w-4" />
                            <span>{getTotalBeds(hostel)} beds total</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-primary">
                            ₵{getMinPrice(hostel).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per bed
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground">
                            {getRoomTypes(hostel)}
                          </p>
                        </div>

                        {/* Room amenities preview */}
                        {hostel.rooms.length > 0 && hostel.rooms[0].amenities.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
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
                      </CardContent>
                    </div>
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

export default AdvancedSearch;

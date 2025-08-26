import { Search, MapPin, Calendar, Users, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

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

interface AdvancedSearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

const AMENITIES = [
  'WiFi', 'Air Conditioning', 'Parking', 'Laundry', 'Kitchen', 
  'Study Room', 'Gym', 'Security', 'Cleaning Service', 'Common Room'
];

const AdvancedSearchBar = ({ filters, onFiltersChange, onSearch }: AdvancedSearchBarProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const updated = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    updateFilter('amenities', updated);
  };

  const clearFilters = () => {
    onFiltersChange({
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
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'amenities') return value.length > 0;
    if (key === 'minPrice') return value > 0;
    if (key === 'maxPrice') return value < 10000;
    if (key === 'rating') return value > 0;
    return value !== '';
  });

  return (
    <Card className="p-6 shadow-strong bg-gradient-card border-0 animate-slide-up">
      {/* Main Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Near which university?" 
              className="pl-10 h-12 border-border/50"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
            />
          </div>
        </div>

        {/* Check-in Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Check-in Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              type="date" 
              className="pl-10 h-12 border-border/50"
              value={filters.checkIn}
              onChange={(e) => updateFilter('checkIn', e.target.value)}
            />
          </div>
        </div>

        {/* Room Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Room Type</label>
          <Select value={filters.roomType} onValueChange={(value) => updateFilter('roomType', value)}>
            <SelectTrigger className="h-12 border-border/50">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Any type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any type</SelectItem>
              <SelectItem value="single">Single Room</SelectItem>
              <SelectItem value="shared">Shared Room</SelectItem>
              <SelectItem value="dormitory">Dormitory</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="flex gap-2">
          <Button variant="ghana" size="lg" className="h-12 flex-1" onClick={onSearch}>
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-12"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-border/50 pt-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Advanced Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Price Range (GH₵)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => updateFilter('minPrice', Number(e.target.value) || 0)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', Number(e.target.value) || 10000)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Hostel Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Hostel Type</label>
              <Select value={filters.hostelType} onValueChange={(value) => updateFilter('hostelType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any type</SelectItem>
                  <SelectItem value="male">Male only</SelectItem>
                  <SelectItem value="female">Female only</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Minimum Rating</label>
              <Select value={filters.rating.toString()} onValueChange={(value) => updateFilter('rating', Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any rating</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Check-out Date</label>
              <Input 
                type="date" 
                className="border-border/50"
                value={filters.checkOut}
                onChange={(e) => updateFilter('checkOut', e.target.value)}
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">Required Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(amenity => (
                <Badge
                  key={amenity}
                  variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                  {filters.amenities.includes(amenity) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdvancedSearchBar;
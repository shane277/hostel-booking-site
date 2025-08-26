import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid3X3, List, Star, MapPin, Users, Wifi, Car, Shield, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../integrations/supabase/types';
import HostelCard from './HostelCard';

type Hostel = Database['public']['Tables']['hostels']['Row'] & {
  amenities: string[];
}

interface ActiveFilters {
  location?: string;
  hostelType?: Database['public']['Enums']['hostel_type'];
  roomType?: Database['public']['Enums']['room_type'];
  checkIn?: string;
  checkOut?: string;
  rating?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  [key: string]: unknown;
}

interface SearchResultsProps {
  hostels: Hostel[];
  loading: boolean;
  searchQuery: string;
  activeFilters: ActiveFilters;
  onClearFilter: (filter: string) => void;
}

type SortOption = 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
type ViewMode = 'grid' | 'list';

const SearchResults = ({ 
  hostels, 
  loading, 
  searchQuery, 
  activeFilters, 
  onClearFilter 
}: SearchResultsProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const sortedHostels = [...hostels].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price_per_semester - b.price_per_semester;
      case 'price_high':
        return b.price_per_semester - a.price_per_semester;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.id).getTime() - new Date(a.id).getTime(); // Placeholder
      default:
        return 0; // relevance
    }
  });

  const getActiveFilterBadges = () => {
    const badges = [];
    
    if (searchQuery) {
      badges.push({
        key: 'search',
        label: `Search: ${searchQuery}`,
        onClear: () => onClearFilter('search')
      });
    }

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;
      
      let label = '';
      switch (key) {
        case 'location':
          label = `Location: ${value}`;
          break;
        case 'hostelType':
          label = `Type: ${value}`;
          break;
        case 'roomType':
          label = `Room: ${value}`;
          break;
        case 'checkIn':
          label = `Check-in: ${value}`;
          break;
        case 'checkOut':
          label = `Check-out: ${value}`;
          break;
        case 'rating':
          if (typeof value === 'number' && value > 0) label = `${value}+ stars`;
          break;
        case 'minPrice':
          if (typeof value === 'number' && value > 0) label = `Min: GH₵${value}`;
          break;
        case 'maxPrice':
          if (typeof value === 'number' && value < 10000) label = `Max: GH₵${value}`;
          break;
        case 'amenities':
          if (Array.isArray(value) && value.length > 0) {
            label = `Amenities: ${value.length} selected`;
          }
          break;
      }
      
      if (label) {
        badges.push({
          key,
          label,
          onClear: () => onClearFilter(key)
        });
      }
    });

    return badges;
  };

  const activeFilterBadges = getActiveFilterBadges();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for controls */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-20 animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading skeleton for results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
              <div className="h-48 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            {sortedHostels.length} hostel{sortedHostels.length !== 1 ? 's' : ''} found
          </p>
          
          {/* Active Filters */}
          {activeFilterBadges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilterBadges.map(({ key, label, onClear }) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="gap-2 cursor-pointer hover:bg-secondary/80"
                  onClick={onClear}
                >
                  {label}
                  <button className="hover:text-destructive">×</button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              {/* <SlidersHorizontal className="h-4 w-4 mr-2" /> */}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              {/* <Grid className="h-4 w-4" /> */}
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              {/* <List className="h-4 w-4" /> */}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Grid/List */}
      {sortedHostels.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {sortedHostels.map(hostel => (
            <HostelCard 
              key={hostel.id}
              id={hostel.id}
              name={hostel.name}
              location={`${hostel.city}, ${hostel.region}`}
              distance="1.2km" // This would be calculated based on user location
              rating={hostel.rating}
              reviewCount={hostel.total_reviews}
              price={hostel.price_per_semester}
              images={hostel.images}
              amenities={hostel.amenities}
              beds={5} // This would come from room data
              isVerified={true}
              
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {/* <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" /> */}
          <h3 className="text-lg font-semibold mb-2">No hostels found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters to find more results.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
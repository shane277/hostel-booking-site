import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bookmark, BookmarkCheck, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '../integrations/supabase/types';

interface SearchFilters {
  location?: string;
  hostelType?: Database['public']['Enums']['hostel_type'];
  roomType?: Database['public']['Enums']['room_type'];
  amenities?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  [key: string]: unknown;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
  resultCount?: number;
}

interface SavedSearchesProps {
  currentFilters: SearchFilters;
  onLoadSearch: (filters: SearchFilters) => void;
}

const SavedSearches = ({ currentFilters, onLoadSearch }: SavedSearchesProps) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = () => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  };

  const saveCurrentSearch = () => {
    const hasFilters = Object.entries(currentFilters).some(([key, value]) => {
      if (key === 'amenities') return Array.isArray(value) && value.length > 0;
      if (key === 'minPrice') return typeof value === 'number' && value > 0;
      if (key === 'maxPrice') return typeof value === 'number' && value < 10000;
      if (key === 'rating') return typeof value === 'number' && value > 0;
      return value !== '';
    });

    if (!hasFilters) {
      toast.error('Please set some filters before saving the search');
      return;
    }

    const searchName = generateSearchName(currentFilters);
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: currentFilters,
      createdAt: new Date().toISOString()
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    toast.success('Search saved successfully!');
  };

  const generateSearchName = (filters: SearchFilters) => {
    const parts = [];
    
    if (filters.location) parts.push(filters.location);
    if (filters.hostelType) parts.push(filters.hostelType);
    if (filters.roomType) parts.push(filters.roomType);
    if (filters.amenities && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
      parts.push(`${filters.amenities.length} amenities`);
    }
    if ((filters.minPrice && filters.minPrice > 0) || (filters.maxPrice && filters.maxPrice < 10000)) {
      parts.push(`GH₵${filters.minPrice || 0}-${filters.maxPrice || 10000}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Custom Search';
  };

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    toast.success('Search deleted');
  };

  const loadSearch = (search: SavedSearch) => {
    onLoadSearch(search.filters);
    toast.success(`Loaded "${search.name}"`);
  };

  if (!showSaved && savedSearches.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={saveCurrentSearch}
        className="flex items-center gap-2"
      >
        <Bookmark className="h-4 w-4" />
        Save Search
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={saveCurrentSearch}
          className="flex items-center gap-2"
        >
          <Bookmark className="h-4 w-4" />
          Save Current Search
        </Button>
        
        {savedSearches.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSaved(!showSaved)}
            className="flex items-center gap-2"
          >
            <BookmarkCheck className="h-4 w-4" />
            Saved ({savedSearches.length})
          </Button>
        )}
      </div>

      {showSaved && savedSearches.length > 0 && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">Saved Searches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedSearches.map(search => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{search.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {new Date(search.createdAt).toLocaleDateString()}
                    </span>
                    {search.resultCount && (
                      <Badge variant="secondary" className="text-xs">
                        {search.resultCount} results
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadSearch(search)}
                    className="flex items-center gap-1"
                  >
                    <Search className="h-3 w-3" />
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSearch(search.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedSearches;
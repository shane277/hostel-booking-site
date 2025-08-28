import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, MapPin, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface SimpleSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
  showSuggestions?: boolean;
  autoNavigate?: boolean;
}

const popularSuggestions = [
  { term: 'University of Ghana - Legon', type: 'location', icon: <MapPin className="h-4 w-4" /> },
  { term: 'KNUST - Kumasi', type: 'location', icon: <MapPin className="h-4 w-4" /> },
  { term: 'University of Cape Coast', type: 'location', icon: <MapPin className="h-4 w-4" /> },
  { term: 'Budget hostels under ₵500', type: 'filter', icon: <TrendingUp className="h-4 w-4" /> },
  { term: 'Female-only hostels', type: 'filter', icon: <TrendingUp className="h-4 w-4" /> },
  { term: 'WiFi-enabled hostels', type: 'filter', icon: <TrendingUp className="h-4 w-4" /> }
];

export default function SimpleSearchBar({ 
  value, 
  onChange, 
  placeholder = "Search hostels, locations, universities...", 
  onSearch,
  showSuggestions = true,
  autoNavigate = true
}: SimpleSearchBarProps) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(popularSuggestions);
  const [liveSuggestions, setLiveSuggestions] = useState<Array<{
    term: string;
    type: string;
    icon: React.ReactNode;
    subtitle?: string;
    id?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch live suggestions from Supabase
  const fetchLiveSuggestions = async (query: string) => {
    if (query.length < 2) {
      setLiveSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Search hostels by name, location, or university
      const { data: hostels, error } = await supabase
        .from('hostels_new')
        .select('id, name, location, university')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%,university.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;

      const suggestions = hostels?.map(hostel => ({
        term: hostel.name,
        type: 'hostel',
        icon: <MapPin className="h-4 w-4" />,
        subtitle: `${hostel.location}`,
        id: hostel.id
      })) || [];

      // Also get unique universities and locations
      const universities = [...new Set(hostels?.map(h => h.university) || [])];
      const locations = [...new Set(hostels?.map(h => h.location) || [])];
      
      const universitysuggestions = universities.map(university => ({
        term: university,
        type: 'university',
        icon: <MapPin className="h-4 w-4" />,
        subtitle: 'University'
      }));

      const locationSuggestions = locations.map(location => ({
        term: location,
        type: 'location',
        icon: <MapPin className="h-4 w-4" />,
        subtitle: 'Location'
      }));

      setLiveSuggestions([...suggestions, ...universitysuggestions, ...locationSuggestions]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setLiveSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (value.length > 0) {
      const filtered = popularSuggestions.filter(suggestion =>
        suggestion.term.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      
      // Fetch live suggestions with debouncing
      const timeoutId = setTimeout(() => {
        fetchLiveSuggestions(value);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setFilteredSuggestions(popularSuggestions);
      setLiveSuggestions([]);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowDropdown(showSuggestions && newValue.length >= 0);
  };

  const handleSearch = (searchValue?: string) => {
    const searchTerm = searchValue || value;
    if (searchTerm.trim()) {
      if (onSearch) {
        onSearch(searchTerm);
      }
      
      if (autoNavigate) {
        const params = new URLSearchParams();
        params.set('location', searchTerm);
        navigate(`/search?${params.toString()}`);
      }
      
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: {
    term: string;
    type: string;
    icon: React.ReactNode;
    subtitle?: string;
    id?: string;
  }) => {
    onChange(suggestion.term);
    if (suggestion.type === 'hostel' && suggestion.id) {
      // Navigate directly to hostel detail page
      navigate(`/hostel/${suggestion.id}`);
    } else {
      handleSearch(suggestion.term);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
      <Input
            ref={inputRef}
        value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowDropdown(showSuggestions)}
            onKeyDown={handleKeyPress}
        placeholder={placeholder}
            className="pl-10 pr-4 h-12 text-lg border-r-0 rounded-r-none focus:border-primary"
          />
        </div>
        <Button 
          onClick={() => handleSearch()}
          className="rounded-l-none px-6 h-12"
          size="lg"
        >
          Search
        </Button>
      </div>

      {/* Search Suggestions Dropdown */}
      {showDropdown && showSuggestions && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border-0 bg-white/95 backdrop-blur-sm"
        >
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {value.length > 0 && (
                <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-purple/5">
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-white/50 p-2 rounded-md transition-colors"
                    onClick={() => handleSearch()}
                  >
                    <SearchIcon className="h-4 w-4 text-primary" />
                    <span className="font-medium">Search for "{value}"</span>
                    <Sparkles className="h-4 w-4 text-primary ml-auto" />
                  </div>
                </div>
              )}
              
              <div className="p-2">
                {/* Live Suggestions from Supabase */}
                {liveSuggestions.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-2">
                      {loading ? 'Searching...' : 'Found Results'}
                    </div>
                    
                    {liveSuggestions.map((suggestion, index) => (
                      <div
                        key={`live-${index}`}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="text-muted-foreground">
                          {suggestion.icon}
                        </div>
                        <div className="flex-1">
                          <span>{suggestion.term}</span>
                          {suggestion.subtitle && (
                            <p className="text-xs text-muted-foreground">{suggestion.subtitle}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type === 'hostel' ? 'Hostel' : 'Location'}
                        </Badge>
                      </div>
                    ))}
                  </>
                )}

                {/* Popular/Filtered Suggestions */}
                {(liveSuggestions.length === 0 || value.length === 0) && (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-2">
                      {value.length > 0 ? 'Popular Suggestions' : 'Popular Searches'}
                    </div>
                    
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={`popular-${index}`}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="text-muted-foreground">
                          {suggestion.icon}
                        </div>
                        <span className="flex-1">{suggestion.term}</span>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type === 'location' ? 'Location' : 'Filter'}
                        </Badge>
                      </div>
                    ))}
                  </>
                )}
                
                {filteredSuggestions.length === 0 && liveSuggestions.length === 0 && value.length > 0 && !loading && (
                  <div className="p-3 text-center text-muted-foreground">
                    <SearchIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No suggestions found</p>
                    <p className="text-xs">Press Enter to search for "{value}"</p>
                  </div>
                )}

                {loading && (
                  <div className="p-3 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm">Searching...</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="border-t p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Quick Actions</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/personality-quiz')}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Personality Quiz
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/buddy-system')}
                    className="text-xs"
                  >
                    Find Roommates
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onChange('');
                      navigate('/search');
                    }}
                    className="text-xs"
                  >
                    Browse All
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
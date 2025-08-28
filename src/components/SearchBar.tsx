import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, MapPin, Calendar, Users, Sparkles, Brain, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  onSearch?: (searchData: SearchData) => void;
  showQuickActions?: boolean;
}

interface SearchData {
  location: string;
  moveInDate: string;
  occupancy: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, showQuickActions = true }) => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState<SearchData>({
    location: '',
    moveInDate: '',
    occupancy: ''
  });

  const handleInputChange = (field: keyof SearchData, value: string) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchData);
    }
    
    // Navigate to search page with parameters
    const params = new URLSearchParams();
    if (searchData.location) params.set('location', searchData.location);
    if (searchData.moveInDate) params.set('checkIn', searchData.moveInDate);
    if (searchData.occupancy) params.set('roomType', searchData.occupancy);
    
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 shadow-strong bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border-0 animate-slide-up backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Near which university?" 
                  className="pl-10 h-12 border-border/50 focus:border-primary transition-colors"
                  value={searchData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Move-in Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Move-in Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  type="date" 
                  className="pl-10 h-12 border-border/50 focus:border-primary transition-colors"
                  value={searchData.moveInDate}
                  onChange={(e) => handleInputChange('moveInDate', e.target.value)}
                />
              </div>
            </div>

            {/* Occupancy Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Occupancy
              </label>
              <Select value={searchData.occupancy} onValueChange={(value) => handleInputChange('occupancy', value)}>
                <SelectTrigger className="h-12 border-border/50 focus:border-primary transition-colors">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">
                    <div className="flex items-center gap-2">
                      <span>Single Room</span>
                      <Badge variant="outline" className="text-xs">Private</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="shared">
                    <div className="flex items-center gap-2">
                      <span>Shared Room</span>
                      <Badge variant="outline" className="text-xs">2-4 beds</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="dormitory">
                    <div className="flex items-center gap-2">
                      <span>Dormitory</span>
                      <Badge variant="outline" className="text-xs">5+ beds</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              size="lg" 
              className="h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-200 transform hover:scale-105"
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              Find Hostels
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/personality-quiz')}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
          >
            <Brain className="h-4 w-4 mr-2" />
            Personality Quiz
            <Sparkles className="h-3 w-3 ml-1" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/search')}
            className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Search
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/buddy-system')}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
          >
            <Users className="h-4 w-4 mr-2" />
            Find Roommates
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
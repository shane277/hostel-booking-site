import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const SearchBar = () => {
  return (
    <Card className="p-6 shadow-strong bg-gradient-card border-0 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Near which university?" 
              className="pl-10 h-12 border-border/50"
            />
          </div>
        </div>

        {/* Move-in Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Move-in Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              type="date" 
              className="pl-10 h-12 border-border/50"
            />
          </div>
        </div>

        {/* Occupancy Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Occupancy</label>
          <Select>
            <SelectTrigger className="h-12 border-border/50">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Room</SelectItem>
              <SelectItem value="shared">Shared Room (2-4 beds)</SelectItem>
              <SelectItem value="dormitory">Dormitory (5+ beds)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button variant="ghana" size="lg" className="h-12">
          <Search className="h-4 w-4" />
          Find Hostels
        </Button>
      </div>
    </Card>
  );
};

export default SearchBar;

import { Star, MapPin, Users, Wifi, Car, Shield, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickMessageButton } from "@/components/QuickMessageButton";
import { Link } from "react-router-dom";

interface HostelCardProps {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  price: number;
  images: string[];
  amenities: string[];
  beds: number;
  isVerified?: boolean;
  isFavorite?: boolean;
  landlordId?: string;
}

const HostelCard = ({ 
  id,
  name, 
  location, 
  distance, 
  rating, 
  reviewCount, 
  price, 
  images, 
  amenities,
  beds,
  isVerified = false,
  isFavorite = false,
  landlordId
}: HostelCardProps) => {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-3 w-3" />;
      case 'parking':
        return <Car className="h-3 w-3" />;
      case 'security':
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 bg-gradient-card">
      <Link to={`/hostel/${id}`}>
        <div className="relative">
          {/* Main Image */}
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img 
              src={images[0] || "/placeholder.svg"} 
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Overlay Elements */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isVerified && (
              <Badge className="bg-success text-white">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 bg-white/80 hover:bg-white ${
              isFavorite ? 'text-ghana-red' : 'text-muted-foreground'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // TODO: Implement favorite functionality
            }}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/hostel/${id}`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                {name}
              </h3>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="line-clamp-1">{location}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 fill-ghana-gold text-ghana-gold" />
              <span className="font-medium">{rating}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>
          </div>

          {/* Distance & Capacity */}
          <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
            <span>{distance} from campus</span>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{beds} beds available</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {getAmenityIcon(amenity)}
                <span className="ml-1">{amenity}</span>
              </Badge>
            ))}
            {amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{amenities.length - 3} more
              </Badge>
            )}
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ₵{price.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">per semester</div>
            </div>
            <div className="flex gap-1">
              <QuickMessageButton
                recipientId={landlordId || ''}
                hostelId={id}
                hostelName={name}
                recipientName="Landlord"
                variant="outline"
                size="sm"
                className="flex-1"
              />
              <Button 
                variant="ghana" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Navigate to booking
                  window.location.href = `/hostel/${id}`;
                }}
                className="flex-1"
              >
                View
              </Button>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default HostelCard;

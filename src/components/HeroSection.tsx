import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Users, Brain, Sparkles, MessageSquare } from "lucide-react";
import SearchBar from "./SearchBar";
import heroImage from "../assets/hero-hostel.jpg";
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSearchNavigation = (searchData: { location: string; moveInDate: string; occupancy: string }) => {
    const params = new URLSearchParams();
    if (searchData.location) params.set('location', searchData.location);
    if (searchData.moveInDate) params.set('checkIn', searchData.moveInDate);
    if (searchData.occupancy) params.set('roomType', searchData.occupancy);
    
    navigate(`/search?${params.toString()}`);
  };
  
  return (
    <div className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Modern hostel for students in Ghana"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Main Heading */}
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-ghana-gold">Student Hostel</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Safe, verified, and affordable hostels for Ghanaian university students. 
              <span className="font-semibold">Book with confidence</span> 🇬🇭
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 animate-slide-up">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Shield className="h-5 w-5 text-ghana-gold" />
              <span className="text-sm font-medium">Verified Hostels</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="h-5 w-5 text-ghana-gold" />
              <span className="text-sm font-medium">Trusted Reviews</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Users className="h-5 w-5 text-ghana-gold" />
              <span className="text-sm font-medium">5,000+ Students</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-slide-up">
            {user ? (
              <>
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => navigate('/search')}
                >
                  Start Searching
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 bg-white/10 border-white text-white hover:bg-white hover:text-foreground"
                  onClick={() => navigate('/landlord-dashboard')}
                >
                  List Your Hostel
                </Button>
              </>
            ) : (
              <>
                <Button variant="hero" size="lg" className="text-lg px-8" asChild>
                  <Link to="/auth?mode=signup">
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 bg-white/10 border-white text-white hover:bg-white hover:text-foreground" asChild>
                  <Link to="/auth?mode=signup">
                    Join as Landlord
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Feature Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/personality-quiz')}
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-foreground transition-all duration-200"
            >
              <Brain className="h-4 w-4 mr-2" />
              Personality Quiz
              <Sparkles className="h-3 w-3 ml-1" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/buddy-system')}
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-foreground transition-all duration-200"
            >
              <Users className="h-4 w-4 mr-2" />
              Find Roommates
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/horror-stories')}
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-foreground transition-all duration-200"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Horror Stories
            </Button>
          </div>

          {/* Search Component */}
          <div className="max-w-5xl mx-auto">
            <SearchBar onSearch={handleSearchNavigation} showQuickActions={false} />
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-ghana-gold/20 rounded-full blur-xl animate-bounce-gentle" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-bounce-gentle" style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default HeroSection;
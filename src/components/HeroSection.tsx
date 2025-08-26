import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Users } from "lucide-react";
import SearchBar from "./SearchBar";
import heroImage from "../assets/hero-hostel.jpg";
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { user } = useAuth();
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            {user ? (
              <>
                <Button variant="hero" size="lg" className="text-lg px-8">
                  Start Searching
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 bg-white/10 border-white text-white hover:bg-white hover:text-foreground">
                  List Your Hostel
                </Button>
              </>
            ) : (
              <>
                <Button variant="hero" size="lg" className="text-lg px-8" asChild>
                  <Link to="/auth">
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

          {/* Search Component */}
          <div className="max-w-5xl mx-auto">
            <SearchBar />
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
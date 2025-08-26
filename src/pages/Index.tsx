import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureShowcase from "@/components/FeatureShowcase";
import PopularHostels from "@/components/PopularHostels";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, MessageCircle, Mail, Users, Ghost, FileText, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeatureShowcase />
      <PopularHostels />
      
      {/* New Features Showcase */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discover Our Amazing Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've built powerful tools to make your hostel experience even better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Personality Quiz */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personality Quiz</h3>
                <p className="text-muted-foreground mb-4">
                  Find your perfect hostel match with our fun personality assessment
                </p>
                <Button asChild className="w-full">
                  <Link to="/personality-quiz">Take the Quiz</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Buddy System */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Buddy System</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with compatible roommates and find your perfect living partner
                </p>
                <Button asChild className="w-full">
                  <Link to="/buddy-system">Find Buddies</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Horror Stories */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ghost className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Horror Stories</h3>
                <p className="text-muted-foreground mb-4">
                  Share your wild hostel experiences and compete for amazing prizes
                </p>
                <Button asChild className="w-full">
                  <Link to="/horror-stories">Share Stories</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Digital Contracts */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Digital Contracts</h3>
                <p className="text-muted-foreground mb-4">
                  Generate and download professional rental agreements instantly
                </p>
                <Button asChild className="w-full">
                  <Link to="/dashboard">Create Contract</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How HostelPadi Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, safe, and secure hostel booking in 3 easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-ghana rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Search & Compare</h3>
              <p className="text-muted-foreground">
                Find verified hostels near your campus with detailed photos and honest reviews
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-ghana rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hold & Pay</h3>
              <p className="text-muted-foreground">
                Reserve with 1-click hold, then pay securely with MoMo or card when ready
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-ghana rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Move In</h3>
              <p className="text-muted-foreground">
                Show your QR code, meet your roommates, and enjoy safe hostel living
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Hostel?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of Ghanaian students who trust HostelPadi for safe, affordable accommodation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8">
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-white/10 border-white text-white hover:bg-white hover:text-foreground">
              Questions? Chat with us
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-ghana rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="text-xl font-bold">HostelPadi</span>
              </div>
              <p className="text-white/70">
                Safe, verified hostels for Ghanaian university students. 
                Built by students, for students.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Find Hostels</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Student Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Landlords</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">List Your Property</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Landlord Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Report Issue</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Emergency SOS</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/70">
            <p>&copy; 2024 HostelPadi. Made with ❤️ for Ghanaian students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

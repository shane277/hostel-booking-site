import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, TrendingUp, Shield, CheckCircle, ArrowRight } from 'lucide-react';

export default function Landlords() {
  const features = [
    {
      icon: <Building className="h-6 w-6" />,
      title: "Easy Property Management",
      description: "List and manage your hostels with our intuitive dashboard"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Quality Students",
      description: "Connect with verified university students across Ghana"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Increase Bookings",
      description: "Reach more students and maximize your occupancy rates"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Get paid securely with our integrated payment system"
    }
  ];

  const benefits = [
    "Zero commission on first 10 bookings",
    "24/7 customer support",
    "Marketing support and promotion",
    "Mobile app for property management",
    "Instant booking notifications",
    "Automated payment collection"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              List Your Hostel on HostelPadi
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Connect with thousands of university students looking for quality accommodation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                List Your Property
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose HostelPadi?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of property owners who trust HostelPadi to manage their student accommodations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 bg-gradient-card hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We provide all the tools and support you need to manage your property and maximize your revenue.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="mt-8" variant="ghana">
                Get Started Today
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <img
                src="/placeholder.svg"
                alt="Property management dashboard"
                className="rounded-lg shadow-strong"
              />
              <div className="absolute -top-4 -right-4 bg-success text-white px-4 py-2 rounded-full font-semibold">
                Free Setup!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Listed Properties</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Occupancy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">8+</div>
              <div className="text-muted-foreground">Universities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to List Your Property?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join HostelPadi today and start earning more from your student accommodation
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
            List Your Hostel Now
          </Button>
        </div>
      </section>
    </div>
  );
}
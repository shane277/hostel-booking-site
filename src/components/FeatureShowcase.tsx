import { Shield, Clock, CreditCard, MapPin, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "SOS Safety Button",
    description: "Emergency alerts sent directly to campus security with your exact location",
    color: "text-ghana-red"
  },
  {
    icon: Clock,
    title: "1-Click Hold",
    description: "Reserve any hostel for 24 hours while you decide - no payment needed",
    color: "text-ghana-gold"
  },
  {
    icon: CreditCard,
    title: "MoMo & Card Payments",
    description: "Secure payments with escrow protection - funds released after move-in",
    color: "text-primary"
  },
  {
    icon: MapPin,
    title: "Campus Proximity",
    description: "Find hostels within walking distance of your university",
    color: "text-accent"
  },
  {
    icon: Users,
    title: "Hostel Buddy System",
    description: "Connect with future roommates before moving in",
    color: "text-purple-600"
  },
  {
    icon: Star,
    title: "Verified Reviews",
    description: "Honest feedback from real students who lived there",
    color: "text-orange-500"
  }
];

const FeatureShowcase = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Students Trust HostelPadi
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built specifically for Ghanaian students with features that matter most for safe, convenient hostel living
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-card"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-background shadow-soft ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
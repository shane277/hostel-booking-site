import Navigation from "@/components/Navigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Shield, Target, Award, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const values = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Student-First",
      description: "Every decision we make prioritizes student welfare and safety"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Trust & Safety",
      description: "Verified properties and secure transactions for peace of mind"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community",
      description: "Building connections between students, landlords, and universities"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Innovation",
      description: "Using technology to solve real problems in student accommodation"
    }
  ];

  const team = [
    {
      name: "Kwame Asante",
      role: "CEO & Co-founder",
      image: "/placeholder.svg",
      description: "Former student housing advocate with 10+ years experience"
    },
    {
      name: "Ama Osei",
      role: "CTO & Co-founder",
      image: "/placeholder.svg",
      description: "Tech entrepreneur passionate about educational technology"
    },
    {
      name: "Kofi Mensah",
      role: "Head of Operations",
      image: "/placeholder.svg",
      description: "Property management expert ensuring quality standards"
    }
  ];

  const milestones = [
    { year: "2023", event: "HostelPadi founded with a vision to transform student housing" },
    { year: "2024", event: "Launched in Accra with University of Ghana partnership" },
    { year: "2024", event: "Expanded to 5 major universities across Ghana" },
    { year: "2024", event: "10,000+ students successfully matched with hostels" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/20 text-white mb-6 px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              Ghana's #1 Student Housing Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Making Student Housing Simple, Safe & Affordable
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              We're on a mission to ensure every Ghanaian student has access to quality, affordable accommodation near their campus.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  HostelPadi was born from a simple observation: finding quality student accommodation in Ghana was unnecessarily difficult, stressful, and often unsafe.
                </p>
                <p>
                  As former university students ourselves, we experienced the frustration of endless searches, unreliable landlords, and substandard living conditions. We knew there had to be a better way.
                </p>
                <p>
                  Today, HostelPadi is transforming how students find homes away from home, creating a trusted marketplace that benefits both students and property owners.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg"
                alt="HostelPadi team"
                className="rounded-lg shadow-strong"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at HostelPadi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-0 bg-gradient-card hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passionate individuals working to revolutionize student housing in Ghana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center border-0 bg-gradient-card">
                <CardContent className="p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground">
              Key milestones in our mission to improve student housing
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 bg-primary rounded-full mt-2"></div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-16 bg-border ml-1.5 mt-2"></div>
                    )}
                  </div>
                  <div>
                    <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-2">
                      {milestone.year}
                    </div>
                    <p className="text-lg">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Students Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Verified Hostels</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">8</div>
              <div className="text-muted-foreground">Universities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the HostelPadi Community
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Whether you're a student looking for accommodation or a property owner, we're here to help
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
              <Link to="/search">Find a Hostel</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link to="/landlords">List Your Property</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
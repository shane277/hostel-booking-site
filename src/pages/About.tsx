import Navigation from "@/components/Navigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Shield, Target, Award, Globe, User, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const values = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Student-First",
      description: "Every feature is designed with the student in mind"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Trust & Safety",
      description: "Verified listings so you know exactly what you're paying for"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community",
      description: "Bringing students, landlords, and universities closer together"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Innovation",
      description: "Using technology to solve real student housing struggles"
    }
  ];

  const milestones = [
    { year: "2024", event: "HostelPadi founded with the vision of transforming student housing" },
    { year: "2024", event: "Launched our first version in Accra" },
    { year: "Today", event: "Growing, improving, and helping students across Ghana find safer and better hostels" }
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
              About HostelPadi
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Making student housing simple, safe, and affordable for every Ghanaian student.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Who We Are</h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                At HostelPadi, we believe finding a hostel in Ghana shouldn't feel like a full-time job. The stress of moving from campus to campus, calling random numbers, or relying on unreliable word-of-mouth is something I experienced myself as a student.
              </p>
              <p>
                That frustration pushed me to start HostelPadi in 2024, with one simple goal:
              </p>
              <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="text-lg font-semibold text-primary">
                  👉 make student housing simple, safe, and affordable for every Ghanaian student.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Our Story</h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                HostelPadi was born from my personal struggle of trying to find a decent hostel as a student. Too often, the process was messy — misleading ads, landlords who weren't transparent, and rooms that didn't match expectations.
              </p>
              <p>
                So instead of just complaining about it, I decided to build a better system. Today, HostelPadi is growing into a trusted community where students can find verified hostels and landlords can connect with tenants easily.
              </p>
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

      {/* Meet the Founder Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Founder</h2>
            </div>
            
            <Card className="border-0 bg-gradient-card">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">👋 Hi, I'm Shane-Tobien Fletcher</h3>
                    <p className="text-primary font-semibold mb-4">Founder of HostelPadi</p>
                    <p className="text-lg text-muted-foreground">
                      Right now, I'm handling everything: from building the platform, to verifying properties, to making sure students and landlords get the best experience possible. What started as my small idea is now becoming Ghana's #1 student housing platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey (So Far)</h2>
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



      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the HostelPadi Community
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Whether you're a student looking for your next hostel or a landlord who wants to list your property, HostelPadi is here to make the process smooth, transparent, and stress-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
              <Link to="/search">Find a Hostel</Link>
            </Button>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
              <Link to="/list-property">List Your Property</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
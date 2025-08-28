import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle,
  Send,
  CheckCircle
} from "lucide-react";

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    subject: '',
    category: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission - in a real app, you'd send this to your support system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent! ✅",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        subject: '',
        category: '',
        message: ''
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BackButton />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Support & Help</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Need help? We're here for you! Get in touch with our support team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">+233 XX XXX XXXX</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">support@hostelbook.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-sm text-muted-foreground">Mon-Fri: 8AM-6PM</p>
                      <p className="text-sm text-muted-foreground">Sat-Sun: 10AM-4PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Quick Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start h-auto p-3" asChild>
                    <a href="/faq">
                      <div className="text-left">
                        <p className="font-medium">How to book a hostel?</p>
                        <p className="text-sm text-muted-foreground">Step-by-step booking guide</p>
                      </div>
                    </a>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start h-auto p-3" asChild>
                    <a href="/faq">
                      <div className="text-left">
                        <p className="font-medium">Payment methods</p>
                        <p className="text-sm text-muted-foreground">Accepted payment options</p>
                      </div>
                    </a>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start h-auto p-3" asChild>
                    <a href="/faq">
                      <div className="text-left">
                        <p className="font-medium">Cancellation policy</p>
                        <p className="text-sm text-muted-foreground">Terms and conditions</p>
                      </div>
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange('category', value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="booking">Booking Issues</SelectItem>
                            <SelectItem value="payment">Payment Problems</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="account">Account Issues</SelectItem>
                            <SelectItem value="property">Property Listing</SelectItem>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="complaint">Complaint</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder="Brief description of your issue"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Please provide as much detail as possible about your issue or question..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Response Time Notice */}
              <Card className="mt-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Quick Response Guaranteed</p>
                      <p className="text-sm text-muted-foreground">
                        We typically respond within 2-4 hours during business hours, 
                        and within 24 hours on weekends.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

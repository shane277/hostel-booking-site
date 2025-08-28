import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Last updated: January 2024
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Your Privacy Matters to Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                At HostelPadi, we are committed to protecting your privacy and ensuring the security 
                of your personal information. This Privacy Policy explains how we collect, use, and 
                safeguard your data when you use our services.
              </p>

              <Separator />

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  1. Information We Collect
                </h3>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground">Personal Information</h4>
                    <p>When you create an account or make a booking, we collect:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Name, email address, and phone number</li>
                      <li>Student ID and institution (for students)</li>
                      <li>Business information (for landlords)</li>
                      <li>Payment information (processed securely by our payment partners)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Usage Information</h4>
                    <p>We automatically collect information about how you use our service:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Pages visited and features used</li>
                      <li>Search queries and preferences</li>
                      <li>Device information and IP address</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
                <p className="text-muted-foreground">We use your information to:</p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                  <li>Provide and improve our services</li>
                  <li>Process bookings and payments</li>
                  <li>Communicate with you about your account and bookings</li>
                  <li>Personalize your experience</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">3. Information Sharing</h3>
                <p className="text-muted-foreground">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                  <li>Property owners (for booking purposes)</li>
                  <li>Payment processors (for transaction processing)</li>
                  <li>Service providers (for platform operations)</li>
                  <li>Legal authorities (when required by law)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">4. Data Security</h3>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure database storage with regular backups</li>
                  <li>Access controls and authentication</li>
                  <li>Regular security audits and updates</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">5. Your Rights</h3>
                <p className="text-muted-foreground">You have the right to:</p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Object to certain data processing</li>
                  <li>Data portability</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">6. Cookies and Tracking</h3>
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to enhance your experience. You can 
                  manage cookie preferences in your browser settings. Essential cookies are 
                  necessary for the platform to function properly.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7. Data Retention</h3>
                <p className="text-muted-foreground">
                  We retain your information for as long as necessary to provide our services 
                  and comply with legal obligations. You can request deletion of your data at any time.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">8. Changes to This Policy</h3>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of 
                  significant changes via email or through our platform.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">9. Contact Us</h3>
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy or your data, contact us at:
                </p>
                <div className="mt-2 text-muted-foreground">
                  <p>Email: privacy@hostelpadi.com</p>
                  <p>Phone: +233 XXX XXX XXX</p>
                  <p>Address: Accra, Ghana</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

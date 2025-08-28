import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TermsOfService = () => {
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
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: January 2024
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome to HostelPadi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                These Terms of Service ("Terms") govern your use of HostelPadi's website and services. 
                By accessing or using our services, you agree to be bound by these Terms.
              </p>

              <Separator />

              <div>
                <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By accessing and using HostelPadi, you accept and agree to be bound by the terms and 
                  provision of this agreement. If you do not agree to abide by the above, please do not 
                  use this service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">2. Use License</h3>
                <p className="text-muted-foreground">
                  Permission is granted to temporarily download one copy of HostelPadi materials for 
                  personal, non-commercial transitory viewing only. This is the grant of a license, 
                  not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">3. User Accounts</h3>
                <p className="text-muted-foreground">
                  When you create an account with us, you must provide information that is accurate, 
                  complete, and current at all times. You are responsible for safeguarding the password 
                  and for all activities that occur under your account.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">4. Booking and Payments</h3>
                <p className="text-muted-foreground">
                  All bookings made through HostelPadi are subject to availability and confirmation. 
                  Payment terms and conditions will be clearly displayed during the booking process. 
                  Refund policies vary by property and will be specified at the time of booking.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">5. User Conduct</h3>
                <p className="text-muted-foreground">
                  Users must not use our service to:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Interfere with the proper functioning of the service</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">6. Privacy Policy</h3>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs 
                  your use of the Service, to understand our practices.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7. Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  HostelPadi shall not be liable for any indirect, incidental, special, consequential, 
                  or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                  or other intangible losses.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">8. Changes to Terms</h3>
                <p className="text-muted-foreground">
                  We reserve the right to modify or replace these Terms at any time. If a revision is 
                  material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">9. Contact Information</h3>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-2 text-muted-foreground">
                  <p>Email: legal@hostelpadi.com</p>
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

export default TermsOfService;

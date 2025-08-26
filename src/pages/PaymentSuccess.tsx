import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const bookingId = searchParams.get('booking_id');
  const { toast } = useToast();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!bookingId) {
        setPaymentStatus('failed');
        setIsVerifying(false);
        return;
      }

      try {
        // Get session ID from URL if available (Stripe redirects with it)
        const sessionId = searchParams.get('session_id') || 
                         new URLSearchParams(window.location.search).get('session_id');
        
        if (sessionId) {
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { bookingId, sessionId }
          });

          if (error) throw error;
          
          if (data.success) {
            setPaymentStatus('verified');
            toast({
              title: "Payment Successful!",
              description: "Your booking has been confirmed.",
              variant: "default",
            });
          } else {
            setPaymentStatus('failed');
          }
        } else {
          // Fallback: just check if booking is already confirmed
          const { data: booking, error } = await supabase
            .from('bookings')
            .select('payment_status, booking_status')
            .eq('id', bookingId)
            .single();

          if (error) throw error;

          if (booking.payment_status === 'completed' && booking.booking_status === 'confirmed') {
            setPaymentStatus('verified');
          } else {
            setPaymentStatus('failed');
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
        toast({
          title: "Verification Error",
          description: "Could not verify payment status. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [bookingId, searchParams, toast]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Verifying your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {paymentStatus === 'verified' ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-destructive text-2xl">✗</span>
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {paymentStatus === 'verified' ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus === 'verified' ? (
            <>
              <p className="text-center text-muted-foreground">
                Your booking has been confirmed and payment processed successfully.
              </p>
              <div className="flex flex-col space-y-2">
                <Button asChild>
                  <Link to="/student-dashboard">
                    View My Bookings
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-muted-foreground">
                There was an issue processing your payment. Please try again or contact support.
              </p>
              <div className="flex flex-col space-y-2">
                <Button asChild>
                  <Link to="/search">
                    Try Again
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
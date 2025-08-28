import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Home, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LoadingProverbs } from '@/components/LoadingProverbs';
import ResendConfirmation from '@/components/ResendConfirmation';

const EmailConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (!token || type !== 'email') {
          setError('Invalid confirmation link. Please check your email for the correct link.');
          setLoading(false);
          return;
        }

        // Verify the email confirmation token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setError(error.message || 'Failed to confirm email. The link may have expired.');
          setShowResend(true);
        } else if (data.user) {
          setConfirmed(true);
          toast({
            title: "Email Confirmed Successfully!",
            description: "Welcome to our hostel booking platform. You can now access all features.",
          });
        }
      } catch (err) {
        console.error('Confirmation error:', err);
        setError('An unexpected error occurred during email confirmation.');
        setShowResend(true);
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, toast]);

  // Countdown and auto-redirect after successful confirmation
  useEffect(() => {
    if (confirmed && user) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Redirect based on user type
            const redirectPath = profile?.user_type === 'landlord' 
              ? '/landlord-dashboard' 
              : '/dashboard';
            navigate(redirectPath);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [confirmed, user, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <LoadingProverbs />
              <p className="text-sm text-muted-foreground text-center">
                Confirming your email address...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto rounded-full bg-red-100 p-3 w-fit">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Email Confirmation Failed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Don't worry! You can try the following options:
                </p>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => setShowResend(!showResend)}
                    variant="outline"
                    className="w-full"
                  >
                    Get New Confirmation Email
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/auth')}
                    variant="ghost"
                    className="w-full"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="w-full"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go to Homepage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {showResend && (
            <ResendConfirmation 
              onSuccess={() => {
                setShowResend(false);
                toast({
                  title: "New confirmation email sent!",
                  description: "Please check your email for the new confirmation link.",
                });
              }}
            />
          )}
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto rounded-full bg-green-100 p-3 w-fit">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-900">Email Confirmed Successfully! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Welcome to our hostel booking platform! Your account has been verified and you now have access to all features.
              </p>
              
              {user && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Redirecting you to your dashboard in {countdown} seconds...
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => {
                  const redirectPath = profile?.user_type === 'landlord' 
                    ? '/landlord-dashboard' 
                    : '/dashboard';
                  navigate(redirectPath);
                }}
                className="w-full"
                disabled={!user}
              >
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Explore Hostels
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>🏠 Ready to find your perfect hostel?</p>
              <p>✨ Use our personality quiz for personalized recommendations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default EmailConfirmation;

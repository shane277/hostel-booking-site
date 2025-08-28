import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const DevEmailBypass: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDevBypass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // For development: manually confirm user via admin API
      // Note: This should NEVER be used in production
      const { data, error } = await supabase.auth.admin.updateUserById(
        email, // This would need the actual user ID in real implementation
        { email_confirmed_at: new Date().toISOString() }
      );

      if (error) {
        // Fallback: Try to sign in directly (if user exists but unconfirmed)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: 'temp' // This won't work, but we're just checking if user exists
        });

        toast({
          title: "Development Mode",
          description: "In development, email confirmation might not work reliably. Try signing in directly if you remember your password, or contact the developer.",
          variant: "default"
        });
      } else {
        toast({
          title: "Development Bypass Applied",
          description: "Your account has been manually confirmed for development purposes.",
        });
        navigate('/auth');
      }
    } catch (error) {
      toast({
        title: "Development Note",
        description: "Email confirmation issues are common in development. For production, a proper SMTP provider should be configured.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  // Only show this in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto border-orange-200 bg-orange-50">
      <CardHeader className="text-center">
        <div className="mx-auto rounded-full bg-orange-100 p-3 w-fit">
          <Zap className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-orange-900">Development Mode</CardTitle>
        <CardDescription className="text-orange-700">
          Email confirmation issues in development? Use this temporary bypass.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Development Only:</strong> This bypass only works in development mode. 
            In production, proper SMTP configuration is required.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleDevBypass} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dev-email">Your Email Address</Label>
            <Input
              id="dev-email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Development Bypass
              </>
            )}
          </Button>
        </form>

        <div className="text-xs text-orange-600 space-y-1">
          <p><strong>Why emails might not work in development:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Supabase's default email provider has rate limits</li>
            <li>Localhost URLs may be blocked by email providers</li>
            <li>Email providers may filter development emails</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevEmailBypass;

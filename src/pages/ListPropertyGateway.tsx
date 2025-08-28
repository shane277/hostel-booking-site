import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingProverbs } from '@/components/LoadingProverbs';
import BackButton from '@/components/BackButton';
import AdvancedListProperty from './AdvancedListProperty';
import { Building, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function ListPropertyGateway() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else {
          setUserRole(profile?.user_type || null);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BackButton />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingProverbs />
          </div>
        </div>
      </div>
    );
  }

  // If user is landlord or admin, show the property listing form
  if (user && (userRole === 'landlord' || userRole === 'admin')) {
    return <AdvancedListProperty />;
  }

  // Default view - show "List Property" button
  return (
    <div className="min-h-screen bg-gray-50">
      <BackButton />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building className="h-12 w-12 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">List Your Property</h1>
                <p className="text-gray-600 mt-2">
                  Share your hostel with students looking for accommodation
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Building className="h-6 w-6 text-blue-600" />
                Ready to List Your Property?
              </CardTitle>
              <CardDescription>
                Join our platform as a landlord and start connecting with students
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <UserCheck className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Verified Students</h3>
                    <p className="text-sm text-gray-600">Connect with verified university students</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Building className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Easy Management</h3>
                    <p className="text-sm text-gray-600">Manage your properties with our dashboard</p>
                  </div>
                </div>
              </div>

              {/* Status-based content */}
              {!user ? (
                // Not logged in
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You need to create an account to list your property on our platform.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => navigate('/auth?mode=signup')}
                      className="flex items-center gap-2 flex-1"
                    >
                      Create Account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/auth')}
                      className="flex items-center gap-2 flex-1"
                    >
                      Already have an account? Login
                    </Button>
                  </div>
                </div>
              ) : userRole === 'student' ? (
                // Logged in as student
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your account is registered as a student. To list properties, you need a landlord account.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Contact our support team to upgrade your account to a landlord account.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/support')}
                      className="flex items-center gap-2"
                    >
                      Contact Support
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                // Unknown role or error
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      There was an issue verifying your account. Please try refreshing the page or contact support.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="flex-1"
                    >
                      Refresh Page
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/support')}
                      className="flex items-center gap-2 flex-1"
                    >
                      Contact Support
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">What you can do as a landlord:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    List multiple properties with detailed information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Manage rooms and bed assignments
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Track occupancy and tenant information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Communicate directly with potential tenants
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

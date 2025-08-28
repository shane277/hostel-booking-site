import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingProverbs } from '@/components/LoadingProverbs';

interface LandlordRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export default function LandlordRoute({ children, fallbackPath = "/" }: LandlordRouteProps) {
  const { user } = useAuth();
  const [isLandlord, setIsLandlord] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLandlordRole = async () => {
      if (!user) {
        setIsLandlord(false);
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
          setIsLandlord(false);
        } else {
          setIsLandlord(profile?.user_type === 'landlord' || profile?.user_type === 'admin');
        }
      } catch (error) {
        console.error('Error checking landlord role:', error);
        setIsLandlord(false);
      } finally {
        setLoading(false);
      }
    };

    checkLandlordRole();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingProverbs />
      </div>
    );
  }

  if (!user || !isLandlord) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

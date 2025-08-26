import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  Calendar, 
  User, 
  Building, 
  Star, 
  MessageCircle, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  Settings,
  Bell
} from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'booking' | 'review' | 'payment' | 'message';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  actionRequired?: boolean;
  data?: Record<string, unknown>;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant: 'default' | 'outline' | 'secondary';
  badge?: string;
}

interface DashboardActivityProps {
  userType: 'student' | 'landlord';
  userId: string;
}

const DashboardActivity = ({ userType, userId }: DashboardActivityProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const recentActivities: ActivityItem[] = [];

      if (userType === 'landlord') {
        // Get landlord's hostels
        const { data: hostels } = await supabase
          .from('hostels')
          .select('id')
          .eq('landlord_id', userId);

        if (hostels && hostels.length > 0) {
          const hostelIds = hostels.map(h => h.id);

          // Get recent bookings with profile info
          const { data: bookings } = await supabase
            .from('bookings')
            .select(`
              *,
              hostels (name)
            `)
            .in('hostel_id', hostelIds)
            .order('created_at', { ascending: false })
            .limit(10);

          // Get profile info separately for bookings
          const studentIds = bookings?.map(b => b.student_id) || [];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', studentIds);

          // Get recent reviews
          const { data: reviews } = await supabase
            .from('reviews')
            .select(`
              *,
              hostels (name)
            `)
            .in('hostel_id', hostelIds)
            .order('created_at', { ascending: false })
            .limit(10);

          // Get profile info for reviews
          const reviewStudentIds = reviews?.map(r => r.student_id) || [];
          const { data: reviewProfiles } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', reviewStudentIds);

          // Process bookings into activities
          bookings?.forEach(booking => {
            const profile = profiles?.find(p => p.user_id === booking.student_id);
            recentActivities.push({
              id: `booking-${booking.id}`,
              type: 'booking',
              title: 'New booking request',
              description: `${profile?.full_name || 'Student'} requested ${booking.hostels?.name}`,
              timestamp: booking.created_at,
              status: booking.booking_status === 'pending' ? 'warning' : 
                      booking.booking_status === 'confirmed' ? 'success' : 'info',
              actionRequired: booking.booking_status === 'pending',
              data: booking
            });
          });

          // Process reviews into activities
          reviews?.forEach(review => {
            const profile = reviewProfiles?.find(p => p.user_id === review.student_id);
            recentActivities.push({
              id: `review-${review.id}`,
              type: 'review',
              title: 'New review received',
              description: `${profile?.full_name || 'Student'} reviewed ${review.hostels?.name} - ${review.rating}★`,
              timestamp: review.created_at,
              status: review.landlord_response ? 'success' : 'warning',
              actionRequired: !review.landlord_response,
              data: review
            });
          });
        }
      } else {
        // Student activities
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            *,
            hostels (name, city)
          `)
          .eq('student_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        // Process student bookings into activities
        bookings?.forEach(booking => {
          recentActivities.push({
            id: `booking-${booking.id}`,
            type: 'booking',
            title: 'Booking status updated',
            description: `Your booking at ${booking.hostels?.name} is ${booking.booking_status}`,
            timestamp: booking.created_at,
            status: booking.booking_status === 'confirmed' ? 'success' : 
                    booking.booking_status === 'pending' ? 'warning' : 'info',
            data: booking
          });
        });

        // Get student's reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select(`
            *,
            hostels (name)
          `)
          .eq('student_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        // Process student reviews into activities
        reviews?.forEach(review => {
          recentActivities.push({
            id: `review-${review.id}`,
            type: 'review',
            title: 'Review posted',
            description: `You reviewed ${review.hostels?.name} - ${review.rating}★`,
            timestamp: review.created_at,
            status: 'success',
            data: review
          });
        });
      }

      // Sort by timestamp and take most recent
      const sortedActivities = recentActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  const setupQuickActions = useCallback(() => {
    if (userType === 'landlord') {
      setQuickActions([
        {
          id: 'add-property',
          title: 'Add New Property',
          description: 'List a new hostel',
          icon: <Building className="h-4 w-4" />,
          action: () => console.log('Add property'),
          variant: 'default'
        },
        {
          id: 'respond-reviews',
          title: 'Respond to Reviews',
          description: 'Customer feedback',
          icon: <MessageCircle className="h-4 w-4" />,
          action: () => console.log('Respond to reviews'),
          variant: 'outline',
          badge: '3 new'
        },
        {
          id: 'view-analytics',
          title: 'View Analytics',
          description: 'Performance insights',
          icon: <Settings className="h-4 w-4" />,
          action: () => console.log('View analytics'),
          variant: 'secondary'
        }
      ]);
    } else {
      setQuickActions([
        {
          id: 'find-hostels',
          title: 'Find Hostels',
          description: 'Browse available properties',
          icon: <Search className="h-4 w-4" />,
          action: () => window.location.href = '/search',
          variant: 'default'
        },
        {
          id: 'view-bookings',
          title: 'My Bookings',
          description: 'Check booking status',
          icon: <Calendar className="h-4 w-4" />,
          action: () => console.log('View bookings'),
          variant: 'outline'
        },
        {
          id: 'notifications',
          title: 'Notifications',
          description: 'Stay updated',
          icon: <Bell className="h-4 w-4" />,
          action: () => console.log('View notifications'),
          variant: 'secondary',
          badge: '2 new'
        }
      ]);
    }
  }, [userType]);

  useEffect(() => {
    fetchActivities();
    setupQuickActions();

    // Set up real-time updates
    const channel = supabase
      .channel('activity-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => fetchActivities()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => fetchActivities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userType, fetchActivities, setupQuickActions]);

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'booking':
        if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
        if (status === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />;
        if (status === 'warning') return <Clock className="h-4 w-4 text-yellow-500" />;
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <p className="text-muted-foreground">
            {userType === 'landlord' ? 'Latest bookings and reviews' : 'Your recent actions'}
          </p>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type, activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        {activity.actionRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                onClick={action.action}
                className="h-auto p-4 justify-start"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    {action.icon}
                    <div className="text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardActivity;
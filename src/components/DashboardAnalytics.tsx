import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  Home,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalBookings: number;
  confirmedBookings: number;
  monthlyRevenue: number;
  averageRating: number;
  pendingReviews: number;
  occupancyRate: number;
  revenueGrowth: number;
  bookingTrends: Array<{ month: string; bookings: number; revenue: number }>;
  topPerformingHostels: Array<{ name: string; bookings: number; revenue: number; rating: number }>;
}

interface DashboardAnalyticsProps {
  userType: 'student' | 'landlord';
  userId: string;
}

const DashboardAnalytics = ({ userType, userId }: DashboardAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBookings: 0,
    confirmedBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    pendingReviews: 0,
    occupancyRate: 0,
    revenueGrowth: 0,
    bookingTrends: [],
    topPerformingHostels: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userId, userType, fetchAnalytics]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      if (userType === 'landlord') {
        await fetchLandlordAnalytics();
      } else {
        await fetchStudentAnalytics();
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLandlordAnalytics = async () => {
    // Get landlord's hostels
    const { data: hostels } = await supabase
      .from('hostels')
      .select('id, name, total_rooms, available_rooms, rating, total_reviews')
      .eq('landlord_id', userId);

    if (!hostels || hostels.length === 0) return;

    const hostelIds = hostels.map(h => h.id);

    // Get bookings data
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .in('hostel_id', hostelIds);

    // Get reviews data
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .in('hostel_id', hostelIds);

    // Calculate analytics
    const totalBookings = bookings?.length || 0;
    const confirmedBookings = bookings?.filter(b => b.booking_status === 'confirmed').length || 0;
    const monthlyRevenue = bookings?.filter(b => b.payment_status === 'completed')
      .reduce((sum, b) => sum + b.total_amount, 0) || 0;
    
    const averageRating = hostels.reduce((sum, h) => sum + h.rating, 0) / hostels.length || 0;
    const pendingReviews = reviews?.filter(r => !r.landlord_response).length || 0;
    
    const totalRooms = hostels.reduce((sum, h) => sum + h.total_rooms, 0);
    const availableRooms = hostels.reduce((sum, h) => sum + h.available_rooms, 0);
    const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0;

    // Calculate revenue growth (mock data for demo)
    const revenueGrowth = Math.random() * 20 - 5; // -5% to +15%

    // Get top performing hostels
    const topPerformingHostels = hostels
      .map(hostel => {
        const hostelBookings = bookings?.filter(b => b.hostel_id === hostel.id) || [];
        const hostelRevenue = hostelBookings
          .filter(b => b.payment_status === 'completed')
          .reduce((sum, b) => sum + b.total_amount, 0);
        
        return {
          name: hostel.name,
          bookings: hostelBookings.length,
          revenue: hostelRevenue,
          rating: hostel.rating
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    setAnalytics({
      totalBookings,
      confirmedBookings,
      monthlyRevenue,
      averageRating,
      pendingReviews,
      occupancyRate,
      revenueGrowth,
      bookingTrends: [], // Would implement with more complex queries
      topPerformingHostels
    });
  };

  const fetchStudentAnalytics = async () => {
    // Get student's bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        *,
        hostels (name, rating),
        reviews (rating)
      `)
      .eq('student_id', userId);

    const totalBookings = bookings?.length || 0;
    const confirmedBookings = bookings?.filter(b => b.booking_status === 'confirmed').length || 0;
    const totalSpent = bookings?.filter(b => b.payment_status === 'completed')
      .reduce((sum, b) => sum + b.total_amount, 0) || 0;

    // Get reviews data
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('student_id', userId);

    const averageRating = reviews?.reduce((sum, r) => sum + r.rating, 0) / (reviews?.length || 1) || 0;
    const pendingReviews = bookings?.filter(b => 
      b.booking_status === 'completed' && 
      !reviews?.find(r => r.booking_id === b.id)
    ).length || 0;

    setAnalytics({
      totalBookings,
      confirmedBookings,
      monthlyRevenue: totalSpent,
      averageRating,
      pendingReviews,
      occupancyRate: 0,
      revenueGrowth: 0,
      bookingTrends: [],
      topPerformingHostels: []
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userType === 'landlord' ? 'Total Revenue' : 'Total Spent'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GH₵{analytics.monthlyRevenue.toLocaleString()}</div>
            {userType === 'landlord' && (
              <div className="flex items-center text-xs text-muted-foreground">
                {analytics.revenueGrowth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(analytics.revenueGrowth).toFixed(1)}% from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            <div className="text-xs text-muted-foreground">
              {analytics.confirmedBookings} confirmed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= analytics.averageRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {userType === 'landlord' ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.occupancyRate.toFixed(1)}%</div>
              <Progress value={analytics.occupancyRate} className="mt-2" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.pendingReviews}</div>
              <div className="text-xs text-muted-foreground">
                Reviews to write
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Analytics for Landlords */}
      {userType === 'landlord' && (
        <>
          {/* Pending Actions */}
          {analytics.pendingReviews > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertCircle className="h-5 w-5" />
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-800 font-medium">
                      {analytics.pendingReviews} review{analytics.pendingReviews !== 1 ? 's' : ''} awaiting your response
                    </p>
                    <p className="text-orange-600 text-sm">
                      Responding to reviews helps build trust with potential students
                    </p>
                  </div>
                  <Button variant="outline" className="border-orange-300 text-orange-800 hover:bg-orange-100">
                    View Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Performing Hostels */}
          {analytics.topPerformingHostels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Properties</CardTitle>
                <CardDescription>Your best performing hostels by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerformingHostels.map((hostel, index) => (
                    <div key={hostel.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{hostel.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {hostel.bookings} bookings • {hostel.rating.toFixed(1)}★
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">GH₵{hostel.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardAnalytics;
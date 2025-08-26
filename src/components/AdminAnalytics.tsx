import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  AlertTriangle,
  Shield,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface AnalyticsData {
  totalUsers: number;
  totalHostels: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyGrowth: number;
  fraudAlerts: number;
  pendingApprovals: number;
}

interface DemandHeatmap {
  region: string;
  demand: number;
  supply: number;
  occupancy: number;
  avgPrice: number;
}

interface FraudAlert {
  id: string;
  type: 'suspicious_booking' | 'fake_review' | 'price_manipulation' | 'fake_hostel';
  severity: 'low' | 'medium' | 'high';
  description: string;
  hostelId?: string;
  userId?: string;
  createdAt: string;
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
}

interface BookingTrend {
  month: string;
  bookings: number;
  revenue: number;
  avgRating: number;
}

interface UserDemographics {
  age: string;
  count: number;
  percentage: number;
}

export const AdminAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalHostels: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    fraudAlerts: 0,
    pendingApprovals: 0
  });
  const [demandHeatmap, setDemandHeatmap] = useState<DemandHeatmap[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [userDemographics, setUserDemographics] = useState<UserDemographics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadBasicStats(),
        loadDemandHeatmap(),
        loadFraudAlerts(),
        loadBookingTrends(),
        loadUserDemographics()
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBasicStats = async () => {
    // Mock data - replace with actual Supabase queries
    setAnalytics({
      totalUsers: 1247,
      totalHostels: 89,
      totalBookings: 3421,
      totalRevenue: 1250000,
      monthlyGrowth: 12.5,
      fraudAlerts: 7,
      pendingApprovals: 23
    });
  };

  const loadDemandHeatmap = async () => {
    // Mock data - replace with actual Supabase queries
    setDemandHeatmap([
      { region: 'Greater Accra', demand: 85, supply: 45, occupancy: 92, avgPrice: 1200 },
      { region: 'Ashanti', demand: 65, supply: 38, occupancy: 88, avgPrice: 950 },
      { region: 'Western', demand: 45, supply: 28, occupancy: 78, avgPrice: 800 },
      { region: 'Central', demand: 55, supply: 32, occupancy: 85, avgPrice: 900 },
      { region: 'Eastern', demand: 35, supply: 22, occupancy: 72, avgPrice: 750 }
    ]);
  };

  const loadFraudAlerts = async () => {
    // Mock data - replace with actual Supabase queries
    setFraudAlerts([
      {
        id: '1',
        type: 'suspicious_booking',
        severity: 'high',
        description: 'Multiple bookings from same IP address in short time',
        hostelId: 'hostel-123',
        userId: 'user-456',
        createdAt: new Date().toISOString(),
        status: 'pending'
      },
      {
        id: '2',
        type: 'fake_review',
        severity: 'medium',
        description: 'Suspicious review pattern detected',
        hostelId: 'hostel-789',
        userId: 'user-101',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'investigating'
      },
      {
        id: '3',
        type: 'price_manipulation',
        severity: 'low',
        description: 'Unusual price changes detected',
        hostelId: 'hostel-456',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'resolved'
      }
    ]);
  };

  const loadBookingTrends = async () => {
    // Mock data - replace with actual Supabase queries
    setBookingTrends([
      { month: 'Jan', bookings: 120, revenue: 45000, avgRating: 4.2 },
      { month: 'Feb', bookings: 135, revenue: 52000, avgRating: 4.3 },
      { month: 'Mar', bookings: 150, revenue: 58000, avgRating: 4.1 },
      { month: 'Apr', bookings: 165, revenue: 62000, avgRating: 4.4 },
      { month: 'May', bookings: 180, revenue: 68000, avgRating: 4.2 },
      { month: 'Jun', bookings: 195, revenue: 72000, avgRating: 4.3 }
    ]);
  };

  const loadUserDemographics = async () => {
    // Mock data - replace with actual Supabase queries
    setUserDemographics([
      { age: '18-22', count: 450, percentage: 36 },
      { age: '23-27', count: 380, percentage: 30 },
      { age: '28-32', count: 220, percentage: 18 },
      { age: '33-37', count: 120, percentage: 10 },
      { age: '38+', count: 77, percentage: 6 }
    ]);
  };

  const handleFraudAlertAction = async (alertId: string, action: 'investigate' | 'resolve' | 'dismiss') => {
    try {
      // Update fraud alert status
      const newStatus = action === 'investigate' ? 'investigating' : 
                       action === 'resolve' ? 'resolved' : 'false_positive';
      
      // Mock API call - replace with actual Supabase update
      setFraudAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      ));

      toast({
        title: "Action Taken",
        description: `Fraud alert ${action}d successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update fraud alert.",
        variant: "destructive",
      });
    }
  };

  const exportAnalytics = () => {
    // Mock export functionality
    const data = {
      analytics,
      demandHeatmap,
      fraudAlerts,
      bookingTrends,
      userDemographics,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Analytics data exported successfully.",
    });
  };

  const getSeverityColor = (severity: FraudAlert['severity']) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[severity];
  };

  const getStatusColor = (status: FraudAlert['status']) => {
    const colors = {
      pending: 'bg-blue-100 text-blue-800',
      investigating: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      false_positive: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights and fraud detection</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTimeframe}
                            onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="p-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{analytics.monthlyGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hostels</p>
                <p className="text-2xl font-bold">{analytics.totalHostels}</p>
              </div>
              <Building className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">{analytics.pendingApprovals} pending approval</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">GH₵{(analytics.totalRevenue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+8.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fraud Alerts</p>
                <p className="text-2xl font-bold">{analytics.fraudAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-red-500">Requires attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDemographics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ age, percentage }) => `${age} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {userDemographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Demand Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Heatmap by Region</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demandHeatmap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="demand" fill="#8884d8" name="Demand" />
              <Bar dataKey="supply" fill="#82ca9d" name="Supply" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fraud Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Fraud Detection Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fraudAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="font-medium">{alert.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {alert.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleFraudAlertAction(alert.id, 'investigate')}>
                        Investigate
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleFraudAlertAction(alert.id, 'dismiss')}>
                        Dismiss
                      </Button>
                    </>
                  )}
                  {alert.status === 'investigating' && (
                    <Button size="sm" onClick={() => handleFraudAlertAction(alert.id, 'resolve')}>
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demandHeatmap.map(region => (
              <div key={region.region} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{region.region}</h4>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Demand:</span>
                    <span className="font-medium">{region.demand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supply:</span>
                    <span className="font-medium">{region.supply}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occupancy:</span>
                    <span className="font-medium">{region.occupancy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Price:</span>
                    <span className="font-medium">GH₵{region.avgPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

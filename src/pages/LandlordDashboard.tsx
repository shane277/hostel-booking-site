import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Home, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Settings, 
  Eye,
  Edit,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Bed,
  BarChart3,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useHostels, useRooms } from '@/hooks/useHostels';
import HostelForm from '@/components/HostelForm';
import DashboardAnalytics from '@/components/DashboardAnalytics';
import DashboardActivity from '@/components/DashboardActivity';
import type { Database } from '../integrations/supabase/types';

type Hostel = Database['public']['Tables']['hostels']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'] & {
  rooms?: {
    room_number: string;
    room_type: Database['public']['Enums']['room_type'];
  };
  profiles?: {
    full_name: string;
    phone_number: string | null;
    institution: Database['public']['Enums']['institution'] | null;
  };
};

interface HostelFormData {
  name: string;
  address: string;
  city: string;
  region: string;
  description?: string;
  hostel_type: Database['public']['Enums']['hostel_type'];
  price_per_semester: number;
  price_per_academic_year?: number;
  security_deposit?: number;
  total_rooms: number;
  amenities?: string[];
  images?: string[];
}

export default function LandlordDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    monthlyRevenue: 0,
    pendingBookings: 0
  });
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [showHostelForm, setShowHostelForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
  const { toast } = useToast();
  const { hostels, loading: hostelsLoading, createHostel, updateHostel, deleteHostel } = useHostels();
  const { rooms } = useRooms(selectedHostel?.id);

  useEffect(() => {
    if (user && profile?.user_type === 'landlord') {
      fetchBookings();
      fetchStats();
    }
  }, [user, profile, hostels]);

  const fetchBookings = async () => {
    if (!user || hostels.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (
            room_number,
            room_type
          ),
          profiles!bookings_student_id_fkey (
            full_name,
            phone_number,
            institution
          )
        `)
        .in('hostel_id', hostels.map(h => h.id))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings((data as Booking[]) || []);
    } catch (error: unknown) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchStats = async () => {
    const totalProperties = hostels.length;
    const totalRooms = hostels.reduce((sum, h) => sum + h.total_rooms, 0);
    const occupiedRooms = totalRooms - hostels.reduce((sum, h) => sum + h.available_rooms, 0);
    const monthlyRevenue = bookings
      .filter(b => b.payment_status === 'completed')
      .reduce((sum, b) => sum + b.total_amount, 0);
    const pendingBookings = bookings.filter(b => b.booking_status === 'pending').length;

    setStats({
      totalProperties,
      totalRooms,
      occupiedRooms,
      monthlyRevenue,
      pendingBookings
    });
  };

  const handleCreateHostel = async (data: HostelFormData) => {
    const result = await createHostel(data);
    if (result) {
      setShowHostelForm(false);
      fetchStats();
    }
  };

  const handleUpdateHostel = async (data: HostelFormData) => {
    if (editingHostel) {
      const result = await updateHostel(editingHostel.id, data);
      if (result) {
        setEditingHostel(null);
        fetchStats();
      }
    }
  };

  const handleDeleteHostel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hostel?')) {
      await deleteHostel(id);
      fetchStats();
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          booking_status: action === 'accept' ? 'confirmed' : 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${action}ed successfully`,
      });

      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.user_type !== 'landlord') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-gentle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.business_name || profile?.full_name || 'Landlord'}
          </h1>
          <p className="text-muted-foreground mb-6">
            Manage your properties and bookings
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRooms}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">GHC {stats.monthlyRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardActivity userType="landlord" userId={user.id} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <DashboardAnalytics userType="landlord" userId={user.id} />
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Properties</h2>
              <Dialog open={showHostelForm} onOpenChange={setShowHostelForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Hostel</DialogTitle>
                  </DialogHeader>
                  <HostelForm onSubmit={handleCreateHostel} />
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-4">
              {hostelsLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">Loading properties...</p>
                  </CardContent>
                </Card>
              ) : hostels.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">No properties yet. Add your first property to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                hostels.map((hostel) => (
                  <Card key={hostel.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{hostel.name}</h3>
                          <p className="text-muted-foreground mb-2">{hostel.address}, {hostel.city}</p>
                          <div className="flex gap-2 mb-2">
                            <Badge variant={hostel.is_active ? "default" : "secondary"}>
                              {hostel.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant={hostel.is_verified ? "default" : "destructive"}>
                              {hostel.is_verified ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedHostel(hostel)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog open={editingHostel?.id === hostel.id} onOpenChange={(open) => !open && setEditingHostel(null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingHostel(hostel)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Hostel</DialogTitle>
                              </DialogHeader>
                              <HostelForm onSubmit={handleUpdateHostel} initialData={editingHostel} isEditing />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <Building className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-semibold capitalize">{hostel.hostel_type.replace('_', ' ')}</p>
                        </div>
                        <div className="text-center">
                          <Bed className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <p className="text-sm text-muted-foreground">Rooms</p>
                          <p className="font-semibold">{hostel.available_rooms}/{hostel.total_rooms}</p>
                        </div>
                        <div className="text-center">
                          <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <p className="text-sm text-muted-foreground">Price/Semester</p>
                          <p className="font-semibold">GHC {hostel.price_per_semester.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <p className="text-sm text-muted-foreground">Reviews</p>
                          <p className="font-semibold">{hostel.total_reviews} ({hostel.rating.toFixed(1)}★)</p>
                        </div>
                      </div>
                      
                      {hostel.amenities && hostel.amenities.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {hostel.amenities.slice(0, 5).map((amenity) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {hostel.amenities.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{hostel.amenities.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Booking Requests</h2>
            </div>
            
            <div className="grid gap-4">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">No booking requests yet.</p>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{booking.profiles?.full_name}</h3>
                          <p className="text-muted-foreground">{booking.profiles?.institution}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.semester} {booking.academic_year}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={booking.booking_status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.booking_status}
                          </Badge>
                          <p className="text-lg font-bold mt-2">GHC {booking.total_amount.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {booking.rooms && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground">Room: {booking.rooms.room_number} ({booking.rooms.room_type})</p>
                        </div>
                      )}
                      
                      {booking.booking_status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleBookingAction(booking.id, 'accept')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleBookingAction(booking.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Business Name</Label>
                    <Input value={profile?.business_name || ''} disabled />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input value={user.email} disabled />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Input value="Landlord" disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Home, User, Settings, CreditCard, Star, BarChart3, Activity } from 'lucide-react';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';
import { ReviewForm } from '@/components/ReviewForm';
import { toast as sonnerToast } from 'sonner';
import DashboardAnalytics from '@/components/DashboardAnalytics';
import DashboardActivity from '@/components/DashboardActivity';

interface Booking {
  id: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  semester: string;
  academic_year: string;
  created_at: string;
  hold_expires_at?: string;
  notes?: string;
  hostels: {
    id: string;
    name: string;
    city: string;
    region: string;
    images: string[];
  };
  rooms?: {
    id: string;
    room_number: string;
    room_type: string;
  };
}

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    institution: profile?.institution || '',
    student_id: profile?.student_id || '',
    program: profile?.program || ''
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        institution: profile.institution || '',
        student_id: profile.student_id || '',
        program: profile.program || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          hostels (
            id,
            name,
            city,
            region,
            images
          ),
          rooms (
            id,
            room_number,
            room_type
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: unknown) {
      console.error('Error fetching bookings:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load your bookings. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again.";
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_hold':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeBookings = bookings.filter(booking => 
    ['pending', 'confirmed', 'on_hold'].includes(booking.booking_status)
  );

  const pastBookings = bookings.filter(booking => 
    ['cancelled', 'completed'].includes(booking.booking_status)
  );

  if (!user || profile?.user_type !== 'student') {
    return (
      <div className="min-h-screen bg-gradient-gentle">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                This page is only accessible to students. Please log in with a student account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/auth">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-gentle">
      <Navigation />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-ghana text-white text-lg">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {profile?.full_name || 'Student'}
                </h1>
                <p className="text-muted-foreground">
                  {profile?.institution && `${profile.institution} • `}
                  {profile?.student_id}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeBookings.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.filter(b => b.payment_status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>My Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <DashboardActivity userType="student" userId={user.id} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <DashboardAnalytics userType="student" userId={user.id} />
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading your bookings...</p>
                </div>
              ) : (
                <>
                  {/* Active Bookings */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Active Bookings</h2>
                    {activeBookings.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">You don't have any active bookings yet.</p>
                          <Button asChild>
                            <Link to="/search">Find a Hostel</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {activeBookings.map((booking) => (
                          <Card key={booking.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-2">
                                    <Link 
                                      to={`/hostel/${booking.hostels.id}`}
                                      className="hover:text-primary transition-colors"
                                    >
                                      {booking.hostels.name}
                                    </Link>
                                  </h3>
                                  <div className="flex items-center text-muted-foreground mb-2">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>{booking.hostels.city}, {booking.hostels.region}</span>
                                  </div>
                                  {booking.rooms && (
                                    <p className="text-sm text-muted-foreground">
                                      Room {booking.rooms.room_number} • {booking.rooms.room_type}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="flex space-x-2 mb-2">
                                    <Badge className={getStatusColor(booking.booking_status)}>
                                      {booking.booking_status.replace('_', ' ')}
                                    </Badge>
                                    <Badge className={getPaymentStatusColor(booking.payment_status)}>
                                      {booking.payment_status}
                                    </Badge>
                                  </div>
                                  <p className="font-semibold">GHS {booking.total_amount}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>{booking.semester} Semester {booking.academic_year}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span>Booked {format(new Date(booking.created_at), 'MMM dd, yyyy')}</span>
                                </div>
                              </div>

                              {booking.booking_status === 'on_hold' && booking.hold_expires_at && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <Clock className="h-4 w-4 inline mr-1" />
                                    Hold expires: {format(new Date(booking.hold_expires_at), 'MMM dd, yyyy HH:mm')}
                                  </p>
                                </div>
                              )}

                               {booking.notes && (
                                 <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                   <p className="text-sm text-gray-700">{booking.notes}</p>
                                 </div>
                               )}

                               {/* Action Buttons for Confirmed Bookings */}
                               {booking.booking_status === 'confirmed' && (
                                 <div className="mt-4 flex gap-2">
                                   <Dialog>
                                     <DialogTrigger asChild>
                                       <Button size="sm" variant="outline">
                                         <Star className="h-4 w-4 mr-1" />
                                         Write Review
                                       </Button>
                                     </DialogTrigger>
                                     <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                       <DialogHeader>
                                         <DialogTitle>Leave a Review for {booking.hostels.name}</DialogTitle>
                                       </DialogHeader>
                                       <ReviewForm
                                         hostelId={booking.hostels.id}
                                         bookingId={booking.id}
                                         hostelName={booking.hostels.name}
                                          onSuccess={() => {
                                            sonnerToast.success('Review submitted successfully!');
                                          }}
                                       />
                                     </DialogContent>
                                   </Dialog>
                                   <Button size="sm" variant="outline">
                                     Contact Landlord
                                   </Button>
                                 </div>
                               )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Booking History */}
                  {pastBookings.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Booking History</h2>
                      <div className="grid gap-4">
                        {pastBookings.map((booking) => (
                          <Card key={booking.id} className="opacity-75">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-2">{booking.hostels.name}</h3>
                                  <div className="flex items-center text-muted-foreground mb-2">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>{booking.hostels.city}, {booking.hostels.region}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>{booking.semester} Semester {booking.academic_year}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge className={getStatusColor(booking.booking_status)}>
                                    {booking.booking_status}
                                  </Badge>
                                  <p className="font-semibold mt-2">GHS {booking.total_amount}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and academic details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        value={profileData.phone_number}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="institution">Institution</Label>
                      <Select 
                        value={profileData.institution} 
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, institution: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your institution" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="university_of_ghana">University of Ghana</SelectItem>
                          <SelectItem value="knust">KNUST</SelectItem>
                          <SelectItem value="ucc">University of Cape Coast</SelectItem>
                          <SelectItem value="ug_legon">UG Legon</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="student_id">Student ID</Label>
                      <Input
                        id="student_id"
                        value={profileData.student_id}
                        onChange={(e) => setProfileData(prev => ({ ...prev, student_id: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="program">Program/Course</Label>
                      <Input
                        id="program"
                        value={profileData.program}
                        onChange={(e) => setProfileData(prev => ({ ...prev, program: e.target.value }))}
                        placeholder="e.g., Computer Science, Business Administration"
                      />
                    </div>
                  </div>
                  <Button onClick={handleProfileUpdate} disabled={updating} className="w-full">
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={user.email} disabled />
                    <p className="text-sm text-muted-foreground">
                      Contact support to change your email address.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Input value="Student" disabled />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Building2,
  Users,
  BedDouble,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  BarChart3,
  Home,
  Calendar,
  DollarSign,
  Settings
} from 'lucide-react';

interface Hostel {
  id: string;
  name: string;
  address: string;
  city: string;
  total_rooms: number;
  occupied_rooms: number;
  price_per_semester: number;
  is_active: boolean;
  created_at: string;
}

interface Room {
  id: string;
  hostel_id: string;
  room_number: string;
  room_type: string;
  total_beds: number;
  occupied_beds: number;
  price_per_bed: number;
  is_available: boolean;
}

interface Tenant {
  id: string;
  room_id: string;
  student_name: string;
  student_email: string;
  student_id: string;
  phone_number: string;
  check_in_date: string;
  check_out_date?: string;
  rent_status: string;
}

interface Analytics {
  totalHostels: number;
  totalRooms: number;
  totalTenants: number;
  occupancyRate: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

export default function LandlordDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State management
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalHostels: 0,
    totalRooms: 0,
    totalTenants: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHostel, setSelectedHostel] = useState<string>('');
  
  // Modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form states
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    room_type: 'single',
    total_beds: 1,
    price_per_bed: 0,
    hostel_id: ''
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchHostels(),
        fetchRooms(),
        fetchTenants(),
        calculateAnalytics()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('landlord_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHostels(data || []);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      // Fallback to empty array for development
      setHostels([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .in('hostel_id', hostels.map(h => h.id))
        .order('room_number');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const fetchTenants = async () => {
    try {
      // This would be a more complex query joining bookings and profiles
      // For now, using a simplified approach
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id(full_name, student_id, phone_number),
          rooms:room_id(room_number, hostel_id)
        `)
        .eq('status', 'confirmed')
        .in('room_id', rooms.map(r => r.id));

      if (error) throw error;
      
      // Transform the data to match our Tenant interface
      const transformedTenants = data?.map((booking: any) => ({
        id: booking.id,
        room_id: booking.room_id,
        student_name: booking.profiles?.full_name || 'Unknown',
        student_email: booking.profiles?.email || '',
        student_id: booking.profiles?.student_id || '',
        phone_number: booking.profiles?.phone_number || '',
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        rent_status: booking.payment_status || 'pending'
      })) || [];

      setTenants(transformedTenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    }
  };

  const calculateAnalytics = async () => {
    try {
      const totalHostels = hostels.length;
      const totalRooms = rooms.length;
      const totalTenants = tenants.length;
      const totalBeds = rooms.reduce((sum, room) => sum + room.total_beds, 0);
      const occupiedBeds = rooms.reduce((sum, room) => sum + room.occupied_beds, 0);
      const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
      
      // Calculate monthly revenue (simplified)
      const monthlyRevenue = tenants.reduce((sum, tenant) => {
        const room = rooms.find(r => r.id === tenant.room_id);
        return sum + (room?.price_per_bed || 0);
      }, 0);

      const pendingPayments = tenants.filter(t => t.rent_status === 'pending').length;

      setAnalytics({
        totalHostels,
      totalRooms,
        totalTenants,
        occupancyRate: Math.round(occupancyRate),
      monthlyRevenue,
        pendingPayments
      });
    } catch (error) {
      console.error('Error calculating analytics:', error);
    }
  };



  const handleCreateRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{
          ...roomForm,
          occupied_beds: 0,
          is_available: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Room created successfully.",
      });

      setShowRoomModal(false);
      setRoomForm({ room_number: '', room_type: 'single', total_beds: 1, price_per_bed: 0, hostel_id: '' });
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRooms = selectedHostel
    ? rooms.filter(room => room.hostel_id === selectedHostel)
    : rooms;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Landlord Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {profile?.full_name || 'Landlord'}! Manage your properties and tenants.
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-orange-200 bg-white/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Hostels</CardTitle>
              <Building2 className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-orange-600">{analytics.totalHostels}</div>
              </CardContent>
            </Card>

          <Card className="border-blue-200 bg-white/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Rooms</CardTitle>
              <BedDouble className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.totalRooms}</div>
              </CardContent>
            </Card>

          <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tenants</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.totalTenants}</div>
              </CardContent>
            </Card>

          <Card className="border-purple-200 bg-white/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Occupancy Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-purple-600">{analytics.occupancyRate}%</div>
              </CardContent>
            </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="hostels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="hostels" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Hostels</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <BedDouble className="h-4 w-4" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="tenants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tenants</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Hostels Tab */}
          <TabsContent value="hostels">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Hostels</CardTitle>
                    <CardDescription>Manage your hostel properties</CardDescription>
                  </div>
                                                      <Button 
                    onClick={() => navigate('/list-property')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Hostel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hostels.map((hostel) => (
                    <Card key={hostel.id} className="border-orange-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{hostel.name}</CardTitle>
                          <Badge variant={hostel.is_active ? "default" : "secondary"}>
                            {hostel.is_active ? "Active" : "Inactive"}
                              </Badge>
                        </div>
                        <CardDescription>{hostel.address}, {hostel.city}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Rooms:</span>
                            <span className="font-medium">{hostel.total_rooms}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Occupied:</span>
                            <span className="font-medium">{hostel.occupied_rooms || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Price/Semester:</span>
                            <span className="font-medium">₵{hostel.price_per_semester}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                    </CardContent>
                  </Card>
                  ))}
                  
                  {hostels.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hostels yet</h3>
                      <p className="text-gray-600 mb-4">Get started by adding your first hostel property.</p>
                      <Button onClick={() => navigate('/list-property')} className="bg-orange-600 hover:bg-orange-700">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Your First Hostel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Room Management</CardTitle>
                    <CardDescription>Manage rooms and bed assignments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={selectedHostel}
                      onChange={(e) => setSelectedHostel(e.target.value)}
                    >
                      <option value="">All Hostels</option>
                      {hostels.map((hostel) => (
                        <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
                      ))}
                    </select>
                    <Dialog open={showRoomModal} onOpenChange={setShowRoomModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Room
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Room</DialogTitle>
                          <DialogDescription>
                            Add a new room to one of your hostels.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="room-hostel">Select Hostel</Label>
                            <select
                              id="room-hostel"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              value={roomForm.hostel_id}
                              onChange={(e) => setRoomForm(prev => ({ ...prev, hostel_id: e.target.value }))}
                            >
                              <option value="">Choose a hostel</option>
                              {hostels.map((hostel) => (
                                <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="room-number">Room Number</Label>
                            <Input
                              id="room-number"
                              value={roomForm.room_number}
                              onChange={(e) => setRoomForm(prev => ({ ...prev, room_number: e.target.value }))}
                              placeholder="e.g., A101"
                            />
                          </div>
                          <div>
                            <Label htmlFor="room-type">Room Type</Label>
                            <select
                              id="room-type"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              value={roomForm.room_type}
                              onChange={(e) => setRoomForm(prev => ({ ...prev, room_type: e.target.value }))}
                            >
                              <option value="single">Single</option>
                              <option value="double">Double</option>
                              <option value="triple">Triple</option>
                              <option value="quad">Quad</option>
                              <option value="dormitory">Dormitory</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="total-beds">Total Beds</Label>
                            <Input
                              id="total-beds"
                              type="number"
                              value={roomForm.total_beds}
                              onChange={(e) => setRoomForm(prev => ({ ...prev, total_beds: parseInt(e.target.value) || 1 }))}
                              min="1"
                              max="8"
                            />
            </div>
                        <div>
                            <Label htmlFor="price-per-bed">Price per Bed (₵)</Label>
                            <Input
                              id="price-per-bed"
                              type="number"
                              value={roomForm.price_per_bed}
                              onChange={(e) => setRoomForm(prev => ({ ...prev, price_per_bed: parseInt(e.target.value) || 0 }))}
                              placeholder="e.g., 750"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowRoomModal(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateRoom} className="bg-blue-600 hover:bg-blue-700">
                            Create Room
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRooms.map((room) => {
                    const hostel = hostels.find(h => h.id === room.hostel_id);
                    const roomTenants = tenants.filter(t => t.room_id === room.id);
                    
                    return (
                      <Card key={room.id} className="border-blue-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                            <Badge variant={room.is_available ? "default" : "secondary"}>
                              {room.is_available ? "Available" : "Full"}
                          </Badge>
                          </div>
                          <CardDescription>{hostel?.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Type:</span>
                              <span className="font-medium capitalize">{room.room_type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Beds:</span>
                              <span className="font-medium">{room.occupied_beds}/{room.total_beds}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Price/Bed:</span>
                              <span className="font-medium">₵{room.price_per_bed}</span>
                        </div>
                      </div>
                      
                          {/* Show tenants in this room */}
                          {roomTenants.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-sm mb-2">Current Tenants:</h4>
                              <div className="space-y-1">
                                {roomTenants.map((tenant) => (
                                  <div key={tenant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm font-medium">{tenant.student_name}</span>
                                    <Badge variant={tenant.rent_status === 'completed' ? 'default' : 'destructive'}>
                                      {tenant.rent_status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                        </div>
                      )}
                      
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <UserPlus className="h-4 w-4" />
                          </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {filteredRooms.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <BedDouble className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
                      <p className="text-gray-600 mb-4">
                        {hostels.length === 0 
                          ? "Add a hostel first, then create rooms for it."
                          : "Add rooms to your hostels to start accepting tenants."
                        }
                      </p>
                      {hostels.length > 0 && (
                        <Button onClick={() => setShowRoomModal(true)} className="bg-blue-600 hover:bg-blue-700">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Your First Room
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                    </CardContent>
                  </Card>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tenant Management</CardTitle>
                    <CardDescription>Search and manage your tenants</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search by name or student ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                  </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTenants.map((tenant) => {
                    const room = rooms.find(r => r.id === tenant.room_id);
                    const hostel = hostels.find(h => h.id === room?.hostel_id);
                    
                    return (
                      <Card key={tenant.id} className="border-green-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{tenant.student_name}</CardTitle>
                            <Badge variant={tenant.rent_status === 'completed' ? 'default' : 'destructive'}>
                              {tenant.rent_status}
                            </Badge>
                          </div>
                          <CardDescription>{tenant.student_email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Student ID:</span>
                              <span className="font-medium">{tenant.student_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Phone:</span>
                              <span className="font-medium">{tenant.phone_number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Hostel:</span>
                              <span className="font-medium">{hostel?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Room:</span>
                              <span className="font-medium">{room?.room_number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Check-in:</span>
                              <span className="font-medium">
                                {new Date(tenant.check_in_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {filteredTenants.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No tenants found' : 'No tenants yet'}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm 
                          ? 'Try adjusting your search terms.'
                          : 'Tenants will appear here when they book rooms in your hostels.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue and payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-green-600" />
                        <div>
                          <h3 className="font-semibold">Monthly Revenue</h3>
                          <p className="text-sm text-gray-600">Current month earnings</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ₵{analytics.monthlyRevenue.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-red-600" />
                        <div>
                          <h3 className="font-semibold">Pending Payments</h3>
                          <p className="text-sm text-gray-600">Overdue rent payments</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {analytics.pendingPayments}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Performance</CardTitle>
                  <CardDescription>Key metrics for your properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Home className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">Occupancy Rate</h3>
                          <p className="text-sm text-gray-600">Current occupancy level</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.occupancyRate}%
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Settings className="h-8 w-8 text-purple-600" />
                        <div>
                          <h3 className="font-semibold">Active Properties</h3>
                          <p className="text-sm text-gray-600">Properties currently listed</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {hostels.filter(h => h.is_active).length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
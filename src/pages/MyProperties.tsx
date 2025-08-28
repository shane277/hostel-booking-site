import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BackButton from '@/components/BackButton';
import { 
  Building, 
  Users, 
  Bed, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus,
  MapPin,
  DollarSign,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Home
} from 'lucide-react';

interface Hostel {
  id: string;
  name: string;
  location: string;
  status: string;
  created_at: string;
  rooms: Room[];
}

interface Room {
  id: string;
  room_number: string;
  capacity: number;
  gender: string;
  price: number;
  amenities: string[];
  beds: Bed[];
}

interface Bed {
  id: string;
  bed_number: number;
  occupant_id: string | null;
  profiles?: {
    full_name: string;
  } | null;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
}

export default function MyProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [assigningBed, setAssigningBed] = useState<string | null>(null);

  const fetchMyProperties = async () => {
    if (!user) return;

    try {
      const { data: hostelData, error: hostelError } = await supabase
        .from('hostels')
        .select(`
          id,
          name,
          location,
          status,
          created_at,
          rooms:rooms (
            id,
            room_number,
            capacity,
            gender,
            price,
            amenities,
            beds:beds (
              id,
              bed_number,
              occupant_id,
              profiles:occupant_id (
                full_name
              )
            )
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (hostelError) {
        console.error('Error fetching hostels:', hostelError);
        toast({
          title: "Error",
          description: "Failed to fetch your properties. Please try again.",
          variant: "destructive",
        });
      } else {
        setHostels(hostelData || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          auth.users!profiles_id_fkey (
            email
          )
        `)
        .eq('role', 'student');

      if (error) {
        console.error('Error fetching students:', error);
      } else {
        const studentsData = userData?.map(profile => ({
          id: profile.id,
          full_name: profile.full_name,
          email: (profile as any).auth?.users?.email || 'No email'
        })) || [];
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const assignStudentToBed = async (bedId: string, studentId: string) => {
    setAssigningBed(bedId);
    
    try {
      const { error } = await supabase
        .from('beds')
        .update({ occupant_id: studentId })
        .eq('id', bedId);

      if (error) {
        console.error('Error assigning student:', error);
        toast({
          title: "Error",
          description: "Failed to assign student to bed. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Student assigned to bed successfully.",
        });
        fetchMyProperties(); // Refresh data
      }
    } catch (error) {
      console.error('Error assigning student:', error);
      toast({
        title: "Error",
        description: "Failed to assign student to bed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAssigningBed(null);
      setSelectedStudent('');
    }
  };

  const removeStudentFromBed = async (bedId: string) => {
    try {
      const { error } = await supabase
        .from('beds')
        .update({ occupant_id: null })
        .eq('id', bedId);

      if (error) {
        console.error('Error removing student:', error);
        toast({
          title: "Error",
          description: "Failed to remove student from bed. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Student removed from bed successfully.",
        });
        fetchMyProperties(); // Refresh data
      }
    } catch (error) {
      console.error('Error removing student:', error);
      toast({
        title: "Error",
        description: "Failed to remove student from bed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return hostels;

    return hostels.map(hostel => ({
      ...hostel,
      rooms: hostel.rooms.filter(room =>
        room.beds.some(bed =>
          bed.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    })).filter(hostel => hostel.rooms.length > 0);
  }, [hostels, searchQuery]);

  useEffect(() => {
    fetchMyProperties();
    fetchStudents();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BackButton />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading your properties...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BackButton />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
              <p className="text-gray-600">Manage your hostels, rooms, and tenants</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/list-property')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                fetchMyProperties();
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Tenants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by tenant name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            {searchQuery && (
              <p className="text-sm text-gray-600 mt-2">
                {filteredData.length > 0 
                  ? `Found tenants in ${filteredData.length} property(ies)`
                  : 'No tenants found matching your search'
                }
              </p>
            )}
          </CardContent>
        </Card>

        {/* Properties List */}
        {hostels.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Listed</h3>
              <p className="text-gray-600 mb-6">
                Start by listing your first property to begin managing tenants.
              </p>
              <Button onClick={() => navigate('/list-property')}>
                <Plus className="h-4 w-4 mr-2" />
                List Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {(searchQuery ? filteredData : hostels).map((hostel) => (
              <Card key={hostel.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        {hostel.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {hostel.location}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(hostel.status)}
                      <Badge variant="outline">
                        {hostel.rooms.length} Room{hostel.rooms.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {hostel.rooms.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No rooms configured for this property. Add rooms to start managing tenants.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hostel.rooms.map((room) => (
                        <Card key={room.id} className="border-2">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                              <Badge variant={room.gender === 'male' ? 'default' : 'secondary'}>
                                {room.gender}
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {room.capacity} beds
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${room.price}/bed
                              </span>
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-3">
                            {/* Beds */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Bed Assignments:</h4>
                              <div className="space-y-2">
                                {room.beds.map((bed) => (
                                  <div
                                    key={bed.id}
                                    className={`p-2 rounded-lg border ${
                                      bed.occupant_id ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Bed className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium">
                                          Bed {bed.bed_number}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        {bed.occupant_id ? (
                                          <>
                                            <Badge variant="outline" className="text-xs">
                                              {bed.profiles?.full_name || 'Unknown'}
                                            </Badge>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => removeStudentFromBed(bed.id)}
                                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                            >
                                              <UserMinus className="h-3 w-3" />
                                            </Button>
                                          </>
                                        ) : (
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                              >
                                                <UserPlus className="h-3 w-3" />
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>Assign Student to Bed</DialogTitle>
                                                <DialogDescription>
                                                  Select a student to assign to Bed {bed.bed_number} in Room {room.room_number}
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <div>
                                                  <Label htmlFor="student-select">Select Student</Label>
                                                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder="Choose a student..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {students.map((student) => (
                                                        <SelectItem key={student.id} value={student.id}>
                                                          {student.full_name} ({student.email})
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                  <Button
                                                    onClick={() => setSelectedStudent('')}
                                                    variant="outline"
                                                  >
                                                    Cancel
                                                  </Button>
                                                  <Button
                                                    onClick={() => assignStudentToBed(bed.id, selectedStudent)}
                                                    disabled={!selectedStudent || assigningBed === bed.id}
                                                  >
                                                    {assigningBed === bed.id ? 'Assigning...' : 'Assign'}
                                                  </Button>
                                                </div>
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Room Stats */}
                            <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
                              <span>
                                {room.beds.filter(b => b.occupant_id).length} / {room.capacity} occupied
                              </span>
                              <span>
                                {room.beds.filter(b => !b.occupant_id).length} available
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

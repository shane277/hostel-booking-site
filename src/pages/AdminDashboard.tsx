import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, MapPin, Users, DollarSign, Calendar, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import BackButton from '@/components/BackButton';

interface Hostel {
  id: string;
  name: string;
  location: string;
  university: string;
  male_rooms: number;
  female_rooms: number;
  beds_per_room: number;
  price_per_bed: number;
  duration_type: string;
  facilities: string[];
  description: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  created_by: string;
  walk_minutes?: number;
  drive_minutes?: number;
  // Profile info
  profiles?: {
    full_name: string;
  };
}

export default function AdminDashboard() {
  const [pendingHostels, setPendingHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingHostels = async () => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select(`
          *,
          profiles:created_by (
            full_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending hostels:', error);
        toast({
          title: "Error",
          description: "Failed to fetch pending hostels. Please try again.",
          variant: "destructive",
        });
      } else {
        setPendingHostels(data || []);
      }
    } catch (error) {
      console.error('Error fetching pending hostels:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending hostels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateHostelStatus = async (hostelId: string, status: 'approved' | 'rejected') => {
    setActionLoading(hostelId);
    
    try {
      const { error } = await supabase
        .from('hostels')
        .update({ status })
        .eq('id', hostelId);

      if (error) {
        console.error('Error updating hostel status:', error);
        toast({
          title: "Error",
          description: `Failed to ${status === 'approved' ? 'approve' : 'reject'} hostel. Please try again.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Hostel ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
        });
        
        // Remove the hostel from the pending list
        setPendingHostels(prev => prev.filter(h => h.id !== hostelId));
      }
    } catch (error) {
      console.error('Error updating hostel status:', error);
      toast({
        title: "Error",
        description: `Failed to ${status === 'approved' ? 'approve' : 'reject'} hostel. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchPendingHostels();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BackButton />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading pending hostels...</p>
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Review and manage hostel listings</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {pendingHostels.length} Pending Review{pendingHostels.length !== 1 ? 's' : ''}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setLoading(true);
                fetchPendingHostels();
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Content */}
        {pendingHostels.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No pending hostels to review. All listings are up to date!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {pendingHostels.map((hostel) => (
              <Card key={hostel.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{hostel.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {hostel.location}
                        {hostel.university && (
                          <>
                            <span>•</span>
                            <span>Near {hostel.university}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Hostel Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {hostel.male_rooms || 0} Male, {hostel.female_rooms || 0} Female rooms
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        ${hostel.price_per_bed} per bed ({hostel.duration_type || 'semester'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {hostel.beds_per_room} beds per room
                      </span>
                    </div>
                  </div>

                  {/* Distance Info */}
                  {(hostel.walk_minutes || hostel.drive_minutes) && (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {hostel.walk_minutes && (
                        <span>🚶‍♂️ {hostel.walk_minutes} min walk</span>
                      )}
                      {hostel.drive_minutes && (
                        <span>🚗 {hostel.drive_minutes} min drive</span>
                      )}
                    </div>
                  )}

                  {/* Facilities */}
                  {hostel.facilities && hostel.facilities.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Facilities:</p>
                      <div className="flex flex-wrap gap-2">
                        {hostel.facilities.map((facility, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {hostel.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Description:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {hostel.description}
                      </p>
                    </div>
                  )}

                  {/* Images */}
                  {hostel.images && hostel.images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Images:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {hostel.images.slice(0, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${hostel.name} - Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        ))}
                      </div>
                      {hostel.images.length > 4 && (
                        <p className="text-xs text-gray-500 mt-1">
                          +{hostel.images.length - 4} more images
                        </p>
                      )}
                    </div>
                  )}

                  {/* Landlord Info */}
                  <div className="text-xs text-gray-500 border-t pt-3">
                    <p>
                      Submitted by: {hostel.profiles?.full_name || 'Unknown'} • 
                      {' '}
                      {new Date(hostel.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => updateHostelStatus(hostel.id, 'approved')}
                      disabled={actionLoading === hostel.id}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {actionLoading === hostel.id ? 'Approving...' : 'Approve'}
                    </Button>
                    
                    <Button
                      onClick={() => updateHostelStatus(hostel.id, 'rejected')}
                      disabled={actionLoading === hostel.id}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      {actionLoading === hostel.id ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

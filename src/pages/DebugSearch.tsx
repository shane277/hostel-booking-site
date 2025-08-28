import { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Building, Database, AlertCircle, CheckCircle } from 'lucide-react';

const DebugSearch = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // Check new hostels table
      const { data: newHostels, error: newError } = await supabase
        .from('hostels')
        .select('*')
        .limit(5);
      
      info.newHostels = {
        data: newHostels,
        error: newError?.message,
        count: newHostels?.length || 0
      };

      // Check old hostels_new table
      const { data: oldHostels, error: oldError } = await supabase
        .from('hostels_new')
        .select('*')
        .limit(5);
      
      info.oldHostels = {
        data: oldHostels,
        error: oldError?.message,
        count: oldHostels?.length || 0
      };

      // Check rooms table
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .limit(5);
      
      info.rooms = {
        data: rooms,
        error: roomsError?.message,
        count: rooms?.length || 0
      };

    } catch (error) {
      info.generalError = error;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const createSampleData = async () => {
    try {
      // Create a sample hostel
      const { data: hostelData, error: hostelError } = await supabase
        .from('hostels')
        .insert([{
          name: 'Sample Student Lodge',
          location: 'East Legon, Accra',
          latitude: 5.6510,
          longitude: -0.1870,
          university: 'University of Ghana (Legon)',
          walk_minutes: 15,
          drive_minutes: 5,
          description: 'A comfortable and safe hostel for students near the University of Ghana.',
          images: ['https://via.placeholder.com/400x300?text=Sample+Hostel'],
          created_by: '00000000-0000-0000-0000-000000000000' // placeholder
        }])
        .select()
        .single();

      if (hostelError) throw hostelError;

      // Create sample rooms
      const { error: roomsError } = await supabase
        .from('rooms')
        .insert([
          {
            hostel_id: hostelData.id,
            gender: 'male',
            capacity: 2,
            room_count: 5,
            price_per_bed: 800,
            amenities: ['wifi', 'kitchen', 'laundry']
          },
          {
            hostel_id: hostelData.id,
            gender: 'female',
            capacity: 2,
            room_count: 3,
            price_per_bed: 850,
            amenities: ['wifi', 'kitchen', 'laundry', 'security']
          }
        ]);

      if (roomsError) throw roomsError;

      alert('Sample data created successfully!');
      checkDatabase(); // Refresh the debug info

    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data: ' + (error as any).message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Database className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Database Debug</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Let's see what's happening with the hostel data
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Checking database...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* New Hostels Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {debugInfo.newHostels?.error ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    New Hostels Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Count:</strong> {debugInfo.newHostels?.count || 0}</p>
                    {debugInfo.newHostels?.error && (
                      <p className="text-red-500"><strong>Error:</strong> {debugInfo.newHostels.error}</p>
                    )}
                    {debugInfo.newHostels?.data && debugInfo.newHostels.data.length > 0 && (
                      <div>
                        <p><strong>Sample Data:</strong></p>
                        <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                          {JSON.stringify(debugInfo.newHostels.data[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Old Hostels Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {debugInfo.oldHostels?.error ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    Old Hostels_New Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Count:</strong> {debugInfo.oldHostels?.count || 0}</p>
                    {debugInfo.oldHostels?.error && (
                      <p className="text-red-500"><strong>Error:</strong> {debugInfo.oldHostels.error}</p>
                    )}
                    {debugInfo.oldHostels?.data && debugInfo.oldHostels.data.length > 0 && (
                      <div>
                        <p><strong>Sample Data:</strong></p>
                        <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                          {JSON.stringify(debugInfo.oldHostels.data[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Rooms Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {debugInfo.rooms?.error ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    Rooms Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Count:</strong> {debugInfo.rooms?.count || 0}</p>
                    {debugInfo.rooms?.error && (
                      <p className="text-red-500"><strong>Error:</strong> {debugInfo.rooms.error}</p>
                    )}
                    {debugInfo.rooms?.data && debugInfo.rooms.data.length > 0 && (
                      <div>
                        <p><strong>Sample Data:</strong></p>
                        <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                          {JSON.stringify(debugInfo.rooms.data[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={checkDatabase} variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Refresh Database Check
                  </Button>
                  
                  <Button onClick={createSampleData}>
                    <Building className="h-4 w-4 mr-2" />
                    Create Sample Data
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Recommendations:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>If no data exists, click "Create Sample Data" to add test hostels</li>
                      <li>Check the browser console for additional error details</li>
                      <li>Make sure your Supabase database migration has been applied</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugSearch;

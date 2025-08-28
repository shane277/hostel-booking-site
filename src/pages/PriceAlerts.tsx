import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, ArrowLeft, Trash2, Plus, Mail } from 'lucide-react';

interface PriceAlert {
  id: string;
  university: string;
  max_price: number;
  created_at: string;
}

const PriceAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    university: '',
    max_price: '',
    email: user?.email || ''
  });

  const universities = [
    'University of Ghana (Legon)',
    'Kwame Nkrumah University of Science and Technology (KNUST)',
    'University of Cape Coast (UCC)',
    'Ghana Institute of Management and Public Administration (GIMPA)',
    'University of Education, Winneba (UEW)',
    'Ashesi University',
    'Central University',
    'Valley View University',
    'Presbyterian University',
    'Methodist University'
  ];

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to set up price alerts.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.university || !formData.max_price || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const price = parseFloat(formData.max_price);
    if (price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Maximum price must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('price_alerts')
        .insert([{
          user_id: user.id,
          university: formData.university,
          max_price: price
        }]);

      if (error) throw error;

      toast({
        title: "Price Alert Created! 🔔",
        description: "We'll notify you when hostels matching your criteria become available.",
      });

      // Reset form and refresh alerts
      setFormData({
        university: '',
        max_price: '',
        email: user?.email || ''
      });
      setShowForm(false);
      fetchAlerts();

    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create price alert. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Deleted",
        description: "Price alert has been removed.",
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <BackButton />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Price Alerts</h1>
            <p className="text-muted-foreground mb-8">
              Please sign in to set up price alerts for hostels.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BackButton />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Price Alerts</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Get notified when hostels matching your criteria become available at your desired price.
            </p>
          </div>

          {/* Create New Alert Button */}
          <div className="mb-6">
            <Button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Alert
            </Button>
          </div>

          {/* New Alert Form */}
          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create Price Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email">Email for Notifications</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        className="pl-10"
                        readOnly
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Notifications will be sent to your account email
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="university">University/Location *</Label>
                    <Select
                      value={formData.university}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, university: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((uni) => (
                          <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="max_price">Maximum Price per Bed (₵) *</Label>
                    <Input
                      id="max_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.max_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_price: e.target.value }))}
                      placeholder="e.g., 1000.00"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      You'll be notified when hostels are available at or below this price
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Creating..." : "Create Alert"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Existing Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Your Price Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Price Alerts Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first price alert to get notified when hostels match your criteria.
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{alert.university}</h4>
                        <p className="text-sm text-muted-foreground">
                          Maximum price: ₵{alert.max_price.toLocaleString()} per bed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(alert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 text-blue-900">How Price Alerts Work</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• We'll check for new hostels matching your criteria daily</li>
                <li>• You'll receive email notifications when matches are found</li>
                <li>• Alerts remain active until you delete them</li>
                <li>• You can create multiple alerts for different universities or price ranges</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PriceAlerts;

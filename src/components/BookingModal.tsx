import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  Bed, 
  CheckCircle,
  X,
  Receipt,
  Shield,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  occupied: number;
  price_per_semester: number;
  price_per_academic_year: number;
  amenities: string[];
  hostel_id: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  hostelName: string;
  onBookingComplete: () => void;
}

type PaymentType = 'deposit' | 'full';
type BookingDuration = 'semester' | 'academic_year';

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  room,
  hostelName,
  onBookingComplete
}) => {
  const [paymentType, setPaymentType] = useState<PaymentType>('deposit');
  const [bookingDuration, setBookingDuration] = useState<BookingDuration>('semester');
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const getTotalPrice = () => {
    const basePrice = bookingDuration === 'semester' 
      ? room.price_per_semester 
      : room.price_per_academic_year;
    
    if (paymentType === 'deposit') {
      return Math.ceil(basePrice * 0.3); // 30% deposit
    }
    return basePrice;
  };

  const getRemainingAmount = () => {
    if (paymentType === 'deposit') {
      const basePrice = bookingDuration === 'semester' 
        ? room.price_per_semester 
        : room.price_per_academic_year;
      return basePrice - getTotalPrice();
    }
    return 0;
  };

  const getCheckOutDate = () => {
    const startDate = new Date();
    if (bookingDuration === 'semester') {
      startDate.setMonth(startDate.getMonth() + 4); // 4 months
    } else {
      startDate.setFullYear(startDate.getFullYear() + 1); // 1 year
    }
    return startDate.toISOString().split('T')[0];
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a room",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create booking record
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          user_id: user.id,
          room_id: room.id,
          check_in_date: new Date().toISOString().split('T')[0],
          check_out_date: getCheckOutDate(),
          total_amount: bookingDuration === 'semester' 
            ? room.price_per_semester 
            : room.price_per_academic_year,
          paid_amount: getTotalPrice(),
          payment_status: paymentType === 'deposit' ? 'partial' : 'completed',
          booking_type: bookingDuration,
          status: 'confirmed',
          deposit_paid: paymentType === 'deposit',
          remaining_amount: getRemainingAmount()
        }])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update room occupancy
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ 
          occupied: room.occupied + 1,
          is_available: room.occupied + 1 < room.capacity
        })
        .eq('id', room.id);

      if (roomError) throw roomError;

      setBookingId(bookingData.id);
      setBookingComplete(true);

      toast({
        title: "✅ Booking Successful!",
        description: `Your room at ${hostelName} has been booked successfully.`,
      });

      onBookingComplete();

    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "❌ Booking Failed",
        description: `Failed to complete booking: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = () => {
    navigate(`/student-dashboard?tab=bookings&booking=${bookingId}`);
  };

  const handleClose = () => {
    if (bookingComplete) {
      navigate('/student-dashboard');
    } else {
      onClose();
    }
  };

  if (bookingComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your room has been successfully booked
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Hostel:</span>
                    <span className="font-medium">{hostelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Room:</span>
                    <span className="font-medium">{room.room_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="font-medium capitalize">{bookingDuration.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount Paid:</span>
                    <span className="font-medium">₵{getTotalPrice().toLocaleString()}</span>
                  </div>
                  {paymentType === 'deposit' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Remaining:</span>
                      <span className="font-medium">₵{getRemainingAmount().toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button onClick={handleViewReceipt} className="w-full">
                <Receipt className="h-4 w-4 mr-2" />
                View Receipt & Details
              </Button>
              <Button variant="outline" onClick={handleClose} className="w-full">
                Go to Dashboard
              </Button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What's Next?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Access your receipt in the dashboard</li>
                    <li>• Chat with roommates via the buddy system</li>
                    <li>• Contact landlord for check-in details</li>
                    {paymentType === 'deposit' && (
                      <li>• Pay remaining amount before check-in</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Booking
          </DialogTitle>
          <DialogDescription>
            Book Room {room.room_number} at {hostelName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Room Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Room Number:</span>
                  <p className="font-medium">{room.room_number}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Room Type:</span>
                  <p className="font-medium capitalize">{room.room_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Available Beds:</span>
                  <p className="font-medium">{room.capacity - room.occupied}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total Capacity:</span>
                  <p className="font-medium">{room.capacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Duration */}
          <div className="space-y-3">
            <Label>Booking Duration</Label>
            <RadioGroup value={bookingDuration} onValueChange={(value: BookingDuration) => setBookingDuration(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="semester" id="semester" />
                <Label htmlFor="semester" className="flex items-center justify-between w-full">
                  <span>Semester (4 months)</span>
                  <span className="font-medium">₵{room.price_per_semester.toLocaleString()}</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="academic_year" id="academic_year" />
                <Label htmlFor="academic_year" className="flex items-center justify-between w-full">
                  <span>Academic Year (12 months)</span>
                  <span className="font-medium">₵{room.price_per_academic_year.toLocaleString()}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Type */}
          <div className="space-y-3">
            <Label>Payment Option</Label>
            <RadioGroup value={paymentType} onValueChange={(value: PaymentType) => setPaymentType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deposit" id="deposit" />
                <Label htmlFor="deposit" className="flex items-center justify-between w-full">
                  <div>
                    <span>Pay Deposit (30%)</span>
                    <p className="text-sm text-muted-foreground">Secure your bed with a deposit</p>
                  </div>
                  <span className="font-medium">₵{Math.ceil((bookingDuration === 'semester' ? room.price_per_semester : room.price_per_academic_year) * 0.3).toLocaleString()}</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex items-center justify-between w-full">
                  <div>
                    <span>Pay Full Amount</span>
                    <p className="text-sm text-muted-foreground">Complete payment upfront</p>
                  </div>
                  <span className="font-medium">₵{(bookingDuration === 'semester' ? room.price_per_semester : room.price_per_academic_year).toLocaleString()}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Base Price ({bookingDuration.replace('_', ' ')}):</span>
                <span>₵{(bookingDuration === 'semester' ? room.price_per_semester : room.price_per_academic_year).toLocaleString()}</span>
              </div>
              {paymentType === 'deposit' && (
                <div className="flex justify-between">
                  <span>Deposit (30%):</span>
                  <span>₵{Math.ceil((bookingDuration === 'semester' ? room.price_per_semester : room.price_per_academic_year) * 0.3).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total to Pay:</span>
                  <span>₵{getTotalPrice().toLocaleString()}</span>
                </div>
                {paymentType === 'deposit' && (
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Remaining:</span>
                    <span>₵{getRemainingAmount().toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important Information:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Your bed will be locked once payment is confirmed</li>
                  <li>• Check-in date: {new Date().toISOString().split('T')[0]}</li>
                  <li>• Check-out date: {getCheckOutDate()}</li>
                  {paymentType === 'deposit' && (
                    <li>• Remaining amount due before check-in</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleBooking}
              disabled={loading}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : `Pay ₵${getTotalPrice().toLocaleString()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


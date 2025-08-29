import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Receipt, 
  Download, 
  Printer, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Bed,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface BookingReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any; // Using any for now, can be typed properly later
}

export const BookingReceipt: React.FC<BookingReceiptProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable version of the receipt
    const receiptContent = document.getElementById('receipt-content');
    if (receiptContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Booking Receipt - ${booking.hostels.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .receipt { border: 1px solid #ccc; padding: 20px; }
                .row { display: flex; justify-content: space-between; margin: 10px 0; }
                .total { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; }
              </style>
            </head>
            <body>
              ${receiptContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Booking Receipt
          </DialogTitle>
          <DialogDescription>
            Receipt for your booking at {booking.hostels.name}
          </DialogDescription>
        </DialogHeader>

        <div id="receipt-content" className="space-y-6">
          {/* Receipt Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold text-primary">HostelPadi</h2>
            <p className="text-muted-foreground">Student Accommodation Platform</p>
            <p className="text-sm text-muted-foreground mt-2">
              Receipt #{booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Hostel:</span>
                  <p className="font-medium">{booking.hostels.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <p className="font-medium">{booking.hostels.city}, {booking.hostels.region}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Room:</span>
                  <p className="font-medium">
                    {booking.rooms ? `Room ${booking.rooms.room_number}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Room Type:</span>
                  <p className="font-medium capitalize">
                    {booking.rooms ? booking.rooms.room_type.replace('_', ' ') : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Check-in:</span>
                  <p className="font-medium">
                    {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Check-out:</span>
                  <p className="font-medium">
                    {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {booking.booking_status === 'confirmed' ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirmed
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      {booking.booking_status.replace('_', ' ')}
                    </>
                  )}
                </Badge>
                <Badge variant={booking.payment_status === 'completed' ? 'default' : 'secondary'}>
                  {booking.payment_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Booking Duration:</span>
                  <span className="font-medium capitalize">
                    {booking.booking_type ? booking.booking_type.replace('_', ' ') : 'Semester'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">₵{booking.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-medium">₵{booking.paid_amount?.toLocaleString()}</span>
                </div>
                {booking.remaining_amount && booking.remaining_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Remaining Amount:</span>
                    <span className="font-medium text-orange-600">₵{booking.remaining_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">Online Payment</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Date:</span>
                  <span className="font-medium">
                    {format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Important Information:</h4>
              <ul className="text-sm space-y-1">
                <li>• Keep this receipt for your records</li>
                <li>• Present this receipt during check-in</li>
                <li>• Contact landlord for check-in details</li>
                {booking.remaining_amount && booking.remaining_amount > 0 && (
                  <li>• Pay remaining amount before check-in</li>
                )}
                <li>• Access roommate chat via the buddy system</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="text-center text-sm text-muted-foreground">
            <p>For support, contact: support@hostelpadi.com</p>
            <p>Thank you for choosing HostelPadi!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

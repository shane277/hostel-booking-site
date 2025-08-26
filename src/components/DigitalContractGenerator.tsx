import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import type { Database } from '../integrations/supabase/types';

type Hostel = Database['public']['Tables']['hostels']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];

interface ContractData {
  bookingId: string;
  studentName: string;
  studentId: string;
  hostelName: string;
  hostelAddress: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  depositAmount: number;
  landlordName: string;
  landlordPhone: string;
  specialTerms: string;
}

interface DigitalContractGeneratorProps {
  booking: Booking;
  hostel: Hostel;
  studentName: string;
  studentId: string;
  landlordName: string;
  landlordPhone: string;
  onContractGenerated: (contractId: string) => void;
}

export const DigitalContractGenerator: React.FC<DigitalContractGeneratorProps> = ({
  booking,
  hostel,
  studentName,
  studentId,
  landlordName,
  landlordPhone,
  onContractGenerated
}) => {
  const [contractData, setContractData] = useState<ContractData>({
    bookingId: booking.id,
    studentName,
    studentId,
    hostelName: hostel.name,
    hostelAddress: hostel.address,
    roomNumber: booking.room_id || 'TBD',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    totalAmount: booking.total_amount,
    depositAmount: hostel.security_deposit || 0,
    landlordName,
    landlordPhone,
    specialTerms: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateContract = async () => {
    setIsGenerating(true);
    
    try {
      // Create contract HTML
      const contractHTML = createContractHTML(contractData);
      
      // Generate PDF using browser's print functionality
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(contractHTML);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      }

      // Generate unique contract ID
      const contractId = `CONTRACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      toast({
        title: "Contract Generated",
        description: "Your contract has been generated and is ready for download.",
      });

      onContractGenerated(contractId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createContractHTML = (data: ContractData): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hostel Rental Agreement</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .party-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .party { flex: 1; margin: 0 10px; }
          .terms { background: #f9f9f9; padding: 15px; border-radius: 5px; }
          .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-box { width: 45%; text-align: center; }
          .signature-line { border-top: 1px solid #333; margin-top: 50px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HOSTEL RENTAL AGREEMENT</h1>
          <p>Contract ID: ${data.bookingId}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h3>1. PARTIES TO THE AGREEMENT</h3>
          <div class="party-info">
            <div class="party">
              <strong>LANDLORD:</strong><br>
              ${data.landlordName}<br>
              Phone: ${data.landlordPhone}<br>
              Property: ${data.hostelName}
            </div>
            <div class="party">
              <strong>TENANT:</strong><br>
              ${data.studentName}<br>
              Student ID: ${data.studentId}<br>
              Phone: [Student Phone]
            </div>
          </div>
        </div>

        <div class="section">
          <h3>2. PROPERTY DETAILS</h3>
          <p><strong>Hostel Name:</strong> ${data.hostelName}</p>
          <p><strong>Address:</strong> ${data.hostelAddress}</p>
          <p><strong>Room Number:</strong> ${data.roomNumber}</p>
        </div>

        <div class="section">
          <h3>3. TERM OF AGREEMENT</h3>
          <p><strong>Check-in Date:</strong> ${data.checkInDate}</p>
          <p><strong>Check-out Date:</strong> ${data.checkOutDate}</p>
          <p><strong>Duration:</strong> Academic Year ${new Date().getFullYear()}/${new Date().getFullYear() + 1}</p>
        </div>

        <div class="section">
          <h3>4. RENTAL TERMS</h3>
          <p><strong>Total Amount:</strong> GH₵${data.totalAmount.toLocaleString()}</p>
          <p><strong>Security Deposit:</strong> GH₵${data.depositAmount.toLocaleString()}</p>
          <p><strong>Payment Schedule:</strong> Per semester</p>
        </div>

        <div class="section">
          <h3>5. RULES AND REGULATIONS</h3>
          <div class="terms">
            <ul>
              <li>Quiet hours from 10:00 PM to 7:00 AM</li>
              <li>No smoking or illegal substances on premises</li>
              <li>Guests must be registered with management</li>
              <li>Kitchen and common areas must be kept clean</li>
              <li>No pets without prior written permission</li>
              <li>Report maintenance issues immediately</li>
              <li>Respect other residents' privacy and space</li>
            </ul>
          </div>
        </div>

        <div class="section">
          <h3>6. SPECIAL TERMS</h3>
          <p>${data.specialTerms || 'No special terms apply.'}</p>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <p><strong>Landlord Signature</strong></p>
            <div class="signature-line"></div>
            <p>Date: _________________</p>
          </div>
          <div class="signature-box">
            <p><strong>Tenant Signature</strong></p>
            <div class="signature-line"></div>
            <p>Date: _________________</p>
          </div>
        </div>

        <div class="footer">
          <p>This agreement is legally binding and subject to Ghanaian rental laws.</p>
          <p>Generated by HostelPadis Hub on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Digital Contract Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                value={contractData.studentName}
                onChange={(e) => setContractData(prev => ({ ...prev, studentName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={contractData.studentId}
                onChange={(e) => setContractData(prev => ({ ...prev, studentId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                value={contractData.roomNumber}
                onChange={(e) => setContractData(prev => ({ ...prev, roomNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="checkInDate">Check-in Date</Label>
              <Input
                id="checkInDate"
                type="date"
                value={contractData.checkInDate}
                onChange={(e) => setContractData(prev => ({ ...prev, checkInDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="checkOutDate">Check-out Date</Label>
              <Input
                id="checkOutDate"
                type="date"
                value={contractData.checkOutDate}
                onChange={(e) => setContractData(prev => ({ ...prev, checkOutDate: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="landlordName">Landlord Name</Label>
              <Input
                id="landlordName"
                value={contractData.landlordName}
                onChange={(e) => setContractData(prev => ({ ...prev, landlordName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="landlordPhone">Landlord Phone</Label>
              <Input
                id="landlordPhone"
                value={contractData.landlordPhone}
                onChange={(e) => setContractData(prev => ({ ...prev, landlordPhone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="totalAmount">Total Amount (GH₵)</Label>
              <Input
                id="totalAmount"
                type="number"
                value={contractData.totalAmount}
                onChange={(e) => setContractData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="depositAmount">Security Deposit (GH₵)</Label>
              <Input
                id="depositAmount"
                type="number"
                value={contractData.depositAmount}
                onChange={(e) => setContractData(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="specialTerms">Special Terms (Optional)</Label>
              <Textarea
                id="specialTerms"
                value={contractData.specialTerms}
                onChange={(e) => setContractData(prev => ({ ...prev, specialTerms: e.target.value }))}
                placeholder="Any additional terms or conditions..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Contract Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{contractData.studentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{contractData.hostelName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{contractData.checkInDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>GH₵{contractData.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={generateContract} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Contract...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate & Download Contract
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">Important Notes</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• This contract will be automatically downloaded as a PDF</li>
                <li>• Both parties must sign the printed contract</li>
                <li>• Keep a copy for your records</li>
                <li>• Contact management for any questions about terms</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import type { Database } from '../integrations/supabase/types';

type HostelType = Database['public']['Enums']['hostel_type'];

interface HostelFormData {
  name: string;
  address: string;
  city: string;
  region: string;
  hostel_type: HostelType;
  price_per_semester: number;
  price_per_academic_year?: number | null;
  security_deposit?: number | null;
  description?: string;
  total_rooms: number;
  available_rooms: number;
  is_active: boolean;
  amenities: string[];
}

interface HostelFormProps {
  onSubmit: (data: HostelFormData) => Promise<void>;
  initialData?: Partial<HostelFormData>;
  isEditing?: boolean;
}

const HOSTEL_TYPES = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'male', label: 'Male Only' },
  { value: 'female', label: 'Female Only' }
];

const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo'
];

const COMMON_AMENITIES = [
  'WiFi', 'Air Conditioning', 'Kitchen', 'Laundry', 'Parking', 'Security', 
  'Water Supply', 'Electricity', 'Study Room', 'Common Area', 'Gym', 'Pool'
];

export default function HostelForm({ onSubmit, initialData, isEditing }: HostelFormProps) {
  const [formData, setFormData] = useState<HostelFormData>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    region: initialData?.region || '',
    hostel_type: initialData?.hostel_type || 'mixed',
    price_per_semester: initialData?.price_per_semester || 0,
    price_per_academic_year: initialData?.price_per_academic_year || null,
    security_deposit: initialData?.security_deposit || null,
    description: initialData?.description || '',
    total_rooms: initialData?.total_rooms || 0,
    available_rooms: initialData?.available_rooms || 0,
    is_active: initialData?.is_active ?? true,
    amenities: initialData?.amenities || [],
  });

  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);
  const [newAmenity, setNewAmenity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAmenity = (amenity: string) => {
    if (amenity && !amenities.includes(amenity)) {
      setAmenities(prev => [...prev, amenity]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(prev => prev.filter(a => a !== amenity));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData: HostelFormData = {
        ...formData,
        amenities,
        price_per_semester: parseFloat(formData.price_per_semester.toString()),
        price_per_academic_year: formData.price_per_academic_year ? parseFloat(formData.price_per_academic_year.toString()) : null,
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit.toString()) : null,
        total_rooms: parseInt(formData.total_rooms.toString()),
        available_rooms: parseInt(formData.available_rooms.toString()),
      };
      
      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Hostel' : 'Add New Hostel'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hostel Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hostel_type">Hostel Type</Label>
              <Select value={formData.hostel_type} onValueChange={(value) => handleInputChange('hostel_type', value as HostelType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hostel type" />
                </SelectTrigger>
                <SelectContent>
                  {HOSTEL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_per_semester">Price per Semester (GHC)</Label>
              <Input
                id="price_per_semester"
                type="number"
                step="0.01"
                value={formData.price_per_semester}
                onChange={(e) => handleInputChange('price_per_semester', parseFloat(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_per_academic_year">Price per Academic Year (GHC)</Label>
              <Input
                id="price_per_academic_year"
                type="number"
                step="0.01"
                value={formData.price_per_academic_year || ''}
                onChange={(e) => handleInputChange('price_per_academic_year', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="security_deposit">Security Deposit (GHC)</Label>
              <Input
                id="security_deposit"
                type="number"
                step="0.01"
                value={formData.security_deposit || ''}
                onChange={(e) => handleInputChange('security_deposit', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_rooms">Total Rooms</Label>
              <Input
                id="total_rooms"
                type="number"
                value={formData.total_rooms}
                onChange={(e) => handleInputChange('total_rooms', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_rooms">Available Rooms</Label>
              <Input
                id="available_rooms"
                type="number"
                value={formData.available_rooms}
                onChange={(e) => handleInputChange('available_rooms', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <Label>Amenities</Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                  {amenity}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeAmenity(amenity)}
                  />
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add custom amenity"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity(newAmenity))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addAmenity(newAmenity)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.filter(a => !amenities.includes(a)).map((amenity) => (
                <Button
                  key={amenity}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addAmenity(amenity)}
                >
                  {amenity}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Hostel' : 'Create Hostel')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Upload, X } from 'lucide-react';
import { useReviews, CreateReviewData } from '@/hooks/useReviews';

interface ReviewFormProps {
  hostelId: string;
  bookingId: string;
  hostelName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  hostelId,
  bookingId,
  hostelName,
  onSuccess,
  onCancel,
}) => {
  const { createReview, loading } = useReviews();
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    roomCleanlinessRating: 0,
    securityRating: 0,
    valueForMoneyRating: 0,
    locationRating: 0,
    facilitiesRating: 0,
    stayDuration: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  const handleStarClick = (rating: number, field: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [field]: rating }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxFiles = 5;
    
    if (photos.length + files.length > maxFiles) {
      return;
    }

    setPhotos(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      return;
    }

    const reviewData: CreateReviewData = {
      hostelId,
      bookingId,
      rating: formData.rating,
      title: formData.title,
      comment: formData.comment,
      photos: photos.length > 0 ? photos : undefined,
      roomCleanlinessRating: formData.roomCleanlinessRating || undefined,
      securityRating: formData.securityRating || undefined,
      valueForMoneyRating: formData.valueForMoneyRating || undefined,
      locationRating: formData.locationRating || undefined,
      facilitiesRating: formData.facilitiesRating || undefined,
      stayDuration: formData.stayDuration || undefined,
    };

    const result = await createReview(reviewData);
    if (result.success) {
      onSuccess?.();
    }
  };

  const renderStarRating = (value: number, field: keyof typeof formData, label: string) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star, field)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review for {hostelName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Overall Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star, 'rating')}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your detailed experience..."
              rows={4}
              maxLength={1000}
            />
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderStarRating(formData.roomCleanlinessRating, 'roomCleanlinessRating', 'Room Cleanliness')}
            {renderStarRating(formData.securityRating, 'securityRating', 'Security')}
            {renderStarRating(formData.valueForMoneyRating, 'valueForMoneyRating', 'Value for Money')}
            {renderStarRating(formData.locationRating, 'locationRating', 'Location')}
            {renderStarRating(formData.facilitiesRating, 'facilitiesRating', 'Facilities')}
          </div>

          {/* Stay Duration */}
          <div className="space-y-2">
            <Label>How long did you stay?</Label>
            <Select value={formData.stayDuration} onValueChange={(value) => setFormData(prev => ({ ...prev, stayDuration: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-semester">1 Semester</SelectItem>
                <SelectItem value="2-semesters">2 Semesters</SelectItem>
                <SelectItem value="1-academic-year">1 Academic Year</SelectItem>
                <SelectItem value="more-than-1-year">More than 1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Add Photos (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload up to 5 photos</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={photos.length >= 5}
                />
                <Label
                  htmlFor="photo-upload"
                  className={`cursor-pointer ${photos.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Button type="button" variant="outline" disabled={photos.length >= 5}>
                    Choose Photos
                  </Button>
                </Label>
              </div>
            </div>

            {/* Photo Preview */}
            {photoPreview.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
                {photoPreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading || formData.rating === 0} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
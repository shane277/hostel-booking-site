import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ReviewData {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  photos?: string[];
  room_cleanliness_rating?: number;
  security_rating?: number;
  value_for_money_rating?: number;
  location_rating?: number;
  facilities_rating?: number;
  stay_duration?: string;
  helpful_count: number;
  landlord_response?: string;
  landlord_response_date?: string;
  is_verified: boolean;
  created_at: string;
  student_id: string;
  hostel_id: string;
  booking_id?: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface CreateReviewData {
  hostelId: string;
  bookingId: string;
  rating: number;
  title?: string;
  comment?: string;
  photos?: File[];
  roomCleanlinessRating?: number;
  securityRating?: number;
  valueForMoneyRating?: number;
  locationRating?: number;
  facilitiesRating?: number;
  stayDuration?: string;
}

export const useReviews = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const uploadPhotos = async (files: File[], reviewId: string): Promise<string[]> => {
    const photoUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${reviewId}/${Date.now()}-${i}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(fileName, file);
      
      if (uploadError) {
        console.error('Photo upload error:', uploadError);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(fileName);
      
      photoUrls.push(publicUrl);
    }
    
    return photoUrls;
  };

  const createReview = useCallback(async (reviewData: CreateReviewData) => {
    if (!user) {
      toast.error('You must be logged in to create a review');
      return { success: false };
    }

    setLoading(true);
    try {
      // Create the review first
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          student_id: user.id,
          hostel_id: reviewData.hostelId,
          booking_id: reviewData.bookingId,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          room_cleanliness_rating: reviewData.roomCleanlinessRating,
          security_rating: reviewData.securityRating,
          value_for_money_rating: reviewData.valueForMoneyRating,
          location_rating: reviewData.locationRating,
          facilities_rating: reviewData.facilitiesRating,
          stay_duration: reviewData.stayDuration,
        })
        .select()
        .single();

      if (reviewError) {
        throw reviewError;
      }

      // Upload photos if any
      let photoUrls: string[] = [];
      if (reviewData.photos && reviewData.photos.length > 0) {
        photoUrls = await uploadPhotos(reviewData.photos, review.id);
        
        // Update review with photo URLs
        if (photoUrls.length > 0) {
          await supabase
            .from('reviews')
            .update({ photos: photoUrls })
            .eq('id', review.id);
        }
      }

      toast.success('Review created successfully!');
      return { success: true, data: review };
    } catch (error: unknown) {
      console.error('Create review error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, uploadPhotos]);

  const fetchHostelReviews = useCallback(async (hostelId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:student_id (
            full_name,
            avatar_url
          )
        `)
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match ReviewData interface
      const transformedData = (data || []).map(review => ({
        ...review,
        profiles: Array.isArray(review.profiles) && review.profiles.length > 0 
          ? review.profiles[0] 
          : null
      }));
      
      return transformedData as ReviewData[];
    } catch (error) {
      console.error('Fetch reviews error:', error);
      return [];
    }
  }, []);

  const markReviewHelpful = useCallback(async (reviewId: string, isHelpful: boolean) => {
    if (!user) {
      toast.error('You must be logged in to vote');
      return;
    }

    try {
      const { error } = await supabase
        .from('review_helpfulness')
        .upsert({
          review_id: reviewId,
          user_id: user.id,
          is_helpful: isHelpful,
        });

      if (error) throw error;
      toast.success(isHelpful ? 'Marked as helpful!' : 'Marked as not helpful!');
    } catch (error: unknown) {
      console.error('Mark helpful error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update vote';
      toast.error(errorMessage);
    }
  }, [user]);

  const addLandlordResponse = useCallback(async (reviewId: string, response: string) => {
    if (!user) {
      toast.error('You must be logged in to respond');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          landlord_response: response,
          landlord_response_date: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;
      toast.success('Response added successfully!');
      return true;
    } catch (error: unknown) {
      console.error('Add response error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add response';
      toast.error(errorMessage);
      return false;
    }
  }, [user]);

  return {
    loading,
    createReview,
    fetchHostelReviews,
    markReviewHelpful,
    addLandlordResponse,
  };
};
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Calendar, CheckCircle } from 'lucide-react';
import { ReviewData } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useReviews } from '@/hooks/useReviews';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: ReviewData;
  showLandlordActions?: boolean;
  onUpdate?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showLandlordActions = false,
  onUpdate,
}) => {
  const { user, profile } = useAuth();
  const { markReviewHelpful, addLandlordResponse } = useReviews();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const handleHelpfulVote = async (isHelpful: boolean) => {
    await markReviewHelpful(review.id, isHelpful);
    onUpdate?.();
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;
    
    setSubmittingResponse(true);
    const success = await addLandlordResponse(review.id, responseText);
    if (success) {
      setShowResponseForm(false);
      setResponseText('');
      onUpdate?.();
    }
    setSubmittingResponse(false);
  };

  const renderStarRating = (rating: number, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderDetailedRatings = () => {
    const ratings = [
      { label: 'Cleanliness', value: review.room_cleanliness_rating },
      { label: 'Security', value: review.security_rating },
      { label: 'Value', value: review.value_for_money_rating },
      { label: 'Location', value: review.location_rating },
      { label: 'Facilities', value: review.facilities_rating },
    ];

    const validRatings = ratings.filter(r => r.value && r.value > 0);
    
    if (validRatings.length === 0) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 p-4 bg-muted/30 rounded-lg">
        {validRatings.map((rating) => (
          <div key={rating.label} className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{rating.label}</p>
            {renderStarRating(rating.value!, 'sm')}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={review.profiles?.avatar_url} />
              <AvatarFallback>
                {review.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{review.profiles?.full_name || 'Anonymous'}</h4>
                {review.is_verified && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                {review.stay_duration && (
                  <>
                    <span>•</span>
                    <span>Stayed for {review.stay_duration}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {renderStarRating(review.rating)}
            <p className="text-sm text-muted-foreground mt-1">
              {review.rating}/5 stars
            </p>
          </div>
        </div>

        {/* Title */}
        {review.title && (
          <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
        )}

        {/* Comment */}
        {review.comment && (
          <p className="text-muted-foreground mb-4 leading-relaxed">
            {review.comment}
          </p>
        )}

        {/* Detailed Ratings */}
        {renderDetailedRatings()}

        {/* Photos */}
        {review.photos && review.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            {review.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Review photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(photo, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Landlord Response */}
        {review.landlord_response && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">Landlord Response</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.landlord_response_date!), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm">{review.landlord_response}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleHelpfulVote(true)}
              disabled={!user}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Helpful ({review.helpful_count})</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleHelpfulVote(false)}
              disabled={!user}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>Not Helpful</span>
            </Button>
          </div>

          {/* Landlord Actions */}
          {showLandlordActions && !review.landlord_response && profile?.user_type === 'landlord' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResponseForm(true)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Respond</span>
            </Button>
          )}
        </div>

        {/* Response Form */}
        {showResponseForm && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-3">Respond to this review</h4>
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response..."
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowResponseForm(false);
                  setResponseText('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitResponse}
                disabled={!responseText.trim() || submittingResponse}
              >
                {submittingResponse ? 'Submitting...' : 'Submit Response'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
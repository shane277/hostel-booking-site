import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { ReviewData } from '@/hooks/useReviews';

interface ReviewsSummaryProps {
  reviews: ReviewData[];
  totalRating: number;
  totalReviews: number;
}

export const ReviewsSummary: React.FC<ReviewsSummaryProps> = ({
  reviews,
  totalRating,
  totalReviews,
}) => {
  const calculateRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const calculateCategoryAverages = () => {
    const categories = [
      { key: 'room_cleanliness_rating', label: 'Cleanliness' },
      { key: 'security_rating', label: 'Security' },
      { key: 'value_for_money_rating', label: 'Value for Money' },
      { key: 'location_rating', label: 'Location' },
      { key: 'facilities_rating', label: 'Facilities' },
    ];

    return categories.map(category => {
      const validRatings = reviews
        .map(review => review[category.key as keyof ReviewData] as number)
        .filter(rating => rating && rating > 0);
      
      const average = validRatings.length > 0 
        ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
        : 0;

      return {
        label: category.label,
        average: Number(average.toFixed(1)),
        count: validRatings.length,
      };
    });
  };

  const distribution = calculateRatingDistribution();
  const categoryAverages = calculateCategoryAverages();

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
          <p className="text-muted-foreground text-center">
            Be the first to share your experience at this hostel
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{totalRating}</div>
              {renderStars(Math.round(totalRating))}
              <p className="text-sm text-muted-foreground mt-2">
                Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{stars}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Progress 
                    value={(distribution[stars as keyof typeof distribution] / totalReviews) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {distribution[stars as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryAverages.map((category) => (
              <div
                key={category.label}
                className="p-4 rounded-lg border bg-card/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{category.label}</h4>
                  <span className="text-lg font-bold">
                    {category.average > 0 ? category.average : '—'}
                  </span>
                </div>
                {category.average > 0 && (
                  <>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= category.average
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {category.count} rating{category.count !== 1 ? 's' : ''}
                    </p>
                  </>
                )}
                {category.average === 0 && (
                  <p className="text-xs text-muted-foreground">No ratings yet</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Ghost, 
  Heart, 
  MessageCircle, 
  Star, 
  Calendar,
  Trophy,
  Award,
  TrendingUp,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookOpen,
  Users,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface HorrorStory {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  hostelName: string;
  category: 'funny' | 'scary' | 'weird' | 'gross' | 'mysterious';
  upvotes: number;
  downvotes: number;
  views: number;
  isAnonymous: boolean;
  createdAt: string;
  userVote?: 'up' | 'down' | null;
}

interface ContestStats {
  totalStories: number;
  totalVotes: number;
  topStory: HorrorStory | null;
  contestEndDate: string;
  prize: string;
}

export const HorrorStoriesContest: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<HorrorStory[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContestStats>({
    totalStories: 0,
    totalVotes: 0,
    topStory: null,
    contestEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    prize: "GH₵500 + Free Hostel Stay"
  });

  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'newest' as 'newest' | 'popular' | 'trending'
  });

  const [storyData, setStoryData] = useState({
    title: '',
    content: '',
    hostelName: '',
    category: 'funny' as HorrorStory['category'],
    isAnonymous: false
  });

  const categories = [
    { value: 'funny', label: 'Funny', icon: <MessageCircle className="h-4 w-4" /> },
    { value: 'scary', label: 'Scary', icon: <Ghost className="h-4 w-4" /> },
    { value: 'weird', label: 'Weird', icon: <Eye className="h-4 w-4" /> },
    { value: 'gross', label: 'Gross', icon: <ThumbsDown className="h-4 w-4" /> },
    { value: 'mysterious', label: 'Mysterious', icon: <BookOpen className="h-4 w-4" /> }
  ];

  useEffect(() => {
    loadStories();
    loadStats();
  }, [filters]);

  const loadStories = async () => {
    try {
      let query = supabase
        .from('horror_stories')
        .select('*')
        .order('createdAt', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Load user votes
      const storiesWithVotes = await Promise.all(
        (data || []).map(async (story) => {
          if (!user) return { ...story, userVote: null };

          const { data: voteData } = await supabase
            .from('story_votes')
            .select('vote_type')
            .eq('story_id', story.id)
            .eq('user_id', user.id)
            .single();

          return {
            ...story,
            userVote: voteData?.vote_type || null
          };
        })
      );

      // Sort based on filter
      const sortedStories = [...storiesWithVotes];
      switch (filters.sortBy) {
        case 'popular':
          sortedStories.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
          break;
        case 'trending':
          sortedStories.sort((a, b) => b.views - a.views);
          break;
        default:
          // newest is already sorted
          break;
      }

      setStories(sortedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { count: totalStories } = await supabase
        .from('horror_stories')
        .select('*', { count: 'exact', head: true });

      const { data: topStory } = await supabase
        .from('horror_stories')
        .select('*')
        .order('upvotes', { ascending: false })
        .limit(1)
        .single();

      setStats(prev => ({
        ...prev,
        totalStories: totalStories || 0,
        topStory: topStory || null
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const submitStory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('horror_stories')
        .insert({
          title: storyData.title,
          content: storyData.content,
          authorId: user.id,
          authorName: storyData.isAnonymous ? 'Anonymous' : (profile?.full_name || 'Unknown'),
          hostelName: storyData.hostelName,
          category: storyData.category,
          isAnonymous: storyData.isAnonymous,
          upvotes: 0,
          downvotes: 0,
          views: 0
        });

      if (error) throw error;

      toast({
        title: "Story Submitted!",
        description: "Your horror story has been submitted successfully!",
      });

      setShowSubmitForm(false);
      setStoryData({
        title: '',
        content: '',
        hostelName: '',
        category: 'funny',
        isAnonymous: false
      });

      loadStories();
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const voteStory = async (storyId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('story_votes')
        .select('*')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        await supabase
          .from('story_votes')
          .update({ vote_type: voteType })
          .eq('story_id', storyId)
          .eq('user_id', user.id);
      } else {
        // Create new vote
        await supabase
          .from('story_votes')
          .insert({
            story_id: storyId,
            user_id: user.id,
            vote_type: voteType
          });
      }

      // Update story votes
      const story = stories.find(s => s.id === storyId);
      if (story) {
        const newUpvotes = story.upvotes + (voteType === 'up' ? 1 : 0);
        const newDownvotes = story.downvotes + (voteType === 'down' ? 1 : 0);

        await supabase
          .from('horror_stories')
          .update({ upvotes: newUpvotes, downvotes: newDownvotes })
          .eq('id', storyId);
      }

      loadStories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareStory = async (story: HorrorStory) => {
    const shareText = `Check out this hostel horror story: "${story.title}" on HostelPadis Hub!`;
    const shareUrl = `${window.location.origin}/horror-stories/${story.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Link Copied",
          description: "Story link copied to clipboard!",
        });
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "Link Copied",
        description: "Story link copied to clipboard!",
      });
    }
  };

  const getCategoryColor = (category: HorrorStory['category']) => {
    const colors = {
      funny: 'bg-yellow-100 text-yellow-800',
      scary: 'bg-red-100 text-red-800',
      weird: 'bg-purple-100 text-purple-800',
      gross: 'bg-green-100 text-green-800',
      mysterious: 'bg-blue-100 text-blue-800'
    };
    return colors[category];
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showSubmitForm) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ghost className="h-5 w-5" />
            Submit Your Horror Story
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title">Story Title</Label>
            <Input
              id="title"
              value={storyData.title}
              onChange={(e) => setStoryData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Give your story a catchy title..."
            />
          </div>

          <div>
            <Label htmlFor="hostelName">Hostel Name</Label>
            <Input
              id="hostelName"
              value={storyData.hostelName}
              onChange={(e) => setStoryData(prev => ({ ...prev, hostelName: e.target.value }))}
              placeholder="Which hostel was this?"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={storyData.category}
              onChange={(e) => setStoryData(prev => ({ ...prev, category: e.target.value as HorrorStory['category'] }))}
              className="w-full p-2 border rounded-md"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="content">Your Story</Label>
            <Textarea
              id="content"
              value={storyData.content}
              onChange={(e) => setStoryData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your hostel horror story... (be creative but respectful!)"
              rows={8}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={storyData.isAnonymous}
              onChange={(e) => setStoryData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
            />
            <Label htmlFor="anonymous">Submit anonymously</Label>
          </div>

          <div className="flex gap-3">
            <Button onClick={submitStory} className="flex-1">
              Submit Story
            </Button>
            <Button variant="outline" onClick={() => setShowSubmitForm(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hostel Horror Stories Contest</h1>
          <p className="text-muted-foreground">Share your wildest hostel experiences and win prizes!</p>
        </div>
        <Button onClick={() => setShowSubmitForm(true)}>
          <Ghost className="h-4 w-4 mr-2" />
          Submit Story
        </Button>
      </div>

      {/* Contest Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalStories}</div>
              <p className="text-sm text-muted-foreground">Stories Submitted</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.prize}</div>
              <p className="text-sm text-muted-foreground">Grand Prize</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.ceil((new Date(stats.contestEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
              </div>
              <p className="text-sm text-muted-foreground">Days Left</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.topStory ? stats.topStory.upvotes : 0}
              </div>
              <p className="text-sm text-muted-foreground">Top Story Votes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Sort By</Label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'newest' | 'popular' | 'trending' }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stories */}
      <div className="space-y-4">
        {stories.map(story => (
          <Card key={story.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={story.authorAvatar} />
                    <AvatarFallback>{story.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{story.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>by {story.authorName}</span>
                      <span>•</span>
                      <span>{story.hostelName}</span>
                      <span>•</span>
                      <span>{getTimeAgo(story.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getCategoryColor(story.category)}>
                  {categories.find(c => c.value === story.category)?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {story.content.length > 200 
                  ? `${story.content.substring(0, 200)}...` 
                  : story.content
                }
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={story.userVote === 'up' ? 'default' : 'outline'}
                      onClick={() => voteStory(story.id, 'up')}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {story.upvotes}
                    </Button>
                    <Button
                      size="sm"
                      variant={story.userVote === 'down' ? 'default' : 'outline'}
                      onClick={() => voteStory(story.id, 'down')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {story.downvotes}
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    {story.views}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => shareStory(story)}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Ghost className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your hostel horror story!
            </p>
            <Button onClick={() => setShowSubmitForm(true)}>
              <Ghost className="h-4 w-4 mr-2" />
              Submit First Story
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

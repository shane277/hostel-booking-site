import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Star, 
  MapPin, 
  Calendar,
  Clock,
  Filter,
  Search,
  UserPlus,
  UserCheck,
  UserX,
  BookOpen,
  Music,
  Coffee,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface BuddyProfile {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  institution: string;
  program: string;
  year: string;
  personality: string;
  interests: string[];
  studyHabits: string;
  sleepSchedule: string;
  budget: string;
  location: string;
  bio: string;
  compatibility: number;
  isMatched: boolean;
  isRequested: boolean;
  createdAt: string;
}

interface BuddyRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export const HostelBuddySystem: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [buddies, setBuddies] = useState<BuddyProfile[]>([]);
  const [myProfile, setMyProfile] = useState<BuddyProfile | null>(null);
  const [requests, setRequests] = useState<BuddyRequest[]>([]);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    institution: '',
    personality: '',
    budget: '',
    location: ''
  });

  const [profileData, setProfileData] = useState({
    institution: profile?.institution || '',
    program: profile?.program || '',
    year: '',
    personality: '',
    interests: [] as string[],
    studyHabits: '',
    sleepSchedule: '',
    budget: '',
    location: '',
    bio: ''
  });

  const personalityTypes = [
    { value: 'studious', label: 'Studious', icon: <BookOpen className="h-4 w-4" /> },
    { value: 'social', label: 'Social', icon: <Users className="h-4 w-4" /> },
    { value: 'creative', label: 'Creative', icon: <Music className="h-4 w-4" /> },
    { value: 'adventurous', label: 'Adventurous', icon: <Coffee className="h-4 w-4" /> }
  ];

  const sleepSchedules = [
    { value: 'early_bird', label: 'Early Bird (6 AM)', icon: <Sun className="h-4 w-4" /> },
    { value: 'night_owl', label: 'Night Owl', icon: <Moon className="h-4 w-4" /> },
    { value: 'flexible', label: 'Flexible', icon: <Clock className="h-4 w-4" /> }
  ];

  const interestOptions = [
    'Reading', 'Gaming', 'Sports', 'Music', 'Art', 'Cooking', 'Travel', 
    'Technology', 'Fitness', 'Photography', 'Dancing', 'Writing'
  ];

  useEffect(() => {
    if (user) {
      loadBuddyProfiles();
      loadMyProfile();
      loadRequests();
    }
  }, [user]);

  const loadBuddyProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('buddy_profiles')
        .select('*')
        .neq('userId', user?.id)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      // Calculate compatibility scores
      const profilesWithCompatibility = (data || []).map(profile => ({
        ...profile,
        compatibility: calculateCompatibility(profile),
        isMatched: false,
        isRequested: false
      }));

      setBuddies(profilesWithCompatibility);
    } catch (error) {
      console.error('Error loading buddy profiles:', error);
    }
  };

  const loadMyProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('buddy_profiles')
        .select('*')
        .eq('userId', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setMyProfile(data);
      setShowCreateProfile(!data);
    } catch (error) {
      console.error('Error loading my profile:', error);
    }
  };

  const loadRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('buddy_requests')
        .select('*')
        .or(`fromUserId.eq.${user.id},toUserId.eq.${user.id}`)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompatibility = (buddyProfile: BuddyProfile): number => {
    if (!myProfile) return 0;

    let score = 0;
    let totalFactors = 0;

    // Personality compatibility
    if (myProfile.personality === buddyProfile.personality) {
      score += 25;
    }
    totalFactors += 25;

    // Sleep schedule compatibility
    if (myProfile.sleepSchedule === buddyProfile.sleepSchedule) {
      score += 20;
    }
    totalFactors += 20;

    // Budget compatibility
    if (myProfile.budget === buddyProfile.budget) {
      score += 20;
    }
    totalFactors += 20;

    // Location preference
    if (myProfile.location === buddyProfile.location) {
      score += 15;
    }
    totalFactors += 15;

    // Interest overlap
    const commonInterests = myProfile.interests.filter(interest => 
      buddyProfile.interests.includes(interest)
    );
    score += (commonInterests.length / Math.max(myProfile.interests.length, 1)) * 20;
    totalFactors += 20;

    return Math.round((score / totalFactors) * 100);
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('buddy_profiles')
        .insert({
          userId: user.id,
          name: profile?.full_name || 'Anonymous',
          institution: profileData.institution,
          program: profileData.program,
          year: profileData.year,
          personality: profileData.personality,
          interests: profileData.interests,
          studyHabits: profileData.studyHabits,
          sleepSchedule: profileData.sleepSchedule,
          budget: profileData.budget,
          location: profileData.location,
          bio: profileData.bio
        });

      if (error) throw error;

      toast({
        title: "Profile Created",
        description: "Your buddy profile has been created successfully!",
      });

      setShowCreateProfile(false);
      loadMyProfile();
      loadBuddyProfiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendBuddyRequest = async (toUserId: string, message: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('buddy_requests')
        .insert({
          fromUserId: user.id,
          toUserId,
          message,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request Sent",
        description: "Your buddy request has been sent!",
      });

      loadRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('buddy_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? "Request Accepted" : "Request Declined",
        description: status === 'accepted' 
          ? "You've accepted the buddy request!" 
          : "You've declined the buddy request.",
      });

      loadRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredBuddies = buddies.filter(buddy => {
    if (filters.institution && buddy.institution !== filters.institution) return false;
    if (filters.personality && buddy.personality !== filters.personality) return false;
    if (filters.budget && buddy.budget !== filters.budget) return false;
    if (filters.location && buddy.location !== filters.location) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showCreateProfile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Your Buddy Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={profileData.institution}
                onChange={(e) => setProfileData(prev => ({ ...prev, institution: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="program">Program</Label>
              <Input
                id="program"
                value={profileData.program}
                onChange={(e) => setProfileData(prev => ({ ...prev, program: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="year">Year of Study</Label>
              <Input
                id="year"
                value={profileData.year}
                onChange={(e) => setProfileData(prev => ({ ...prev, year: e.target.value }))}
                placeholder="e.g., 2nd Year"
              />
            </div>
            <div>
              <Label htmlFor="personality">Personality Type</Label>
              <select
                id="personality"
                value={profileData.personality}
                onChange={(e) => setProfileData(prev => ({ ...prev, personality: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select personality</option>
                {personalityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="sleepSchedule">Sleep Schedule</Label>
              <select
                id="sleepSchedule"
                value={profileData.sleepSchedule}
                onChange={(e) => setProfileData(prev => ({ ...prev, sleepSchedule: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select schedule</option>
                {sleepSchedules.map(schedule => (
                  <option key={schedule.value} value={schedule.value}>{schedule.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="budget">Budget Range</Label>
              <select
                id="budget"
                value={profileData.budget}
                onChange={(e) => setProfileData(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select budget</option>
                <option value="budget">Budget (GH₵500-1000)</option>
                <option value="mid-range">Mid-range (GH₵1000-2000)</option>
                <option value="premium">Premium (GH₵2000+)</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Interests (Select multiple)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {interestOptions.map(interest => (
                <label key={interest} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={profileData.interests.includes(interest)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfileData(prev => ({
                          ...prev,
                          interests: [...prev.interests, interest]
                        }));
                      } else {
                        setProfileData(prev => ({
                          ...prev,
                          interests: prev.interests.filter(i => i !== interest)
                        }));
                      }
                    }}
                  />
                  <span className="text-sm">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="studyHabits">Study Habits</Label>
            <Textarea
              id="studyHabits"
              value={profileData.studyHabits}
              onChange={(e) => setProfileData(prev => ({ ...prev, studyHabits: e.target.value }))}
              placeholder="Describe your study habits and preferences..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="location">Preferred Location</Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Near University of Ghana"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell potential roommates about yourself..."
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={createProfile} className="flex-1">
              Create Profile
            </Button>
            <Button variant="outline" onClick={() => setShowCreateProfile(false)}>
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
          <h1 className="text-2xl font-bold">Hostel Buddy System</h1>
          <p className="text-muted-foreground">Find your perfect roommate match!</p>
        </div>
        {myProfile && (
          <Button onClick={() => setShowCreateProfile(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Update Profile
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Institution</Label>
              <select
                value={filters.institution}
                onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Institutions</option>
                <option value="university_of_ghana">University of Ghana</option>
                <option value="knust">KNUST</option>
                <option value="ucc">University of Cape Coast</option>
              </select>
            </div>
            <div>
              <Label>Personality</Label>
              <select
                value={filters.personality}
                onChange={(e) => setFilters(prev => ({ ...prev, personality: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Personalities</option>
                {personalityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Budget</Label>
              <select
                value={filters.budget}
                onChange={(e) => setFilters(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Budgets</option>
                <option value="budget">Budget</option>
                <option value="mid-range">Mid-range</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Search location..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buddy Requests */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Buddy Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{request.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {request.status === 'pending' && request.toUserId === user?.id && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleRequestResponse(request.id, 'accepted')}>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRequestResponse(request.id, 'rejected')}>
                        <UserX className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}
                  {request.status !== 'pending' && (
                    <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'}>
                      {request.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buddy Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuddies.map(buddy => (
          <Card key={buddy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={buddy.avatar} />
                    <AvatarFallback>{buddy.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{buddy.name}</h3>
                    <p className="text-sm text-muted-foreground">{buddy.institution}</p>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {buddy.compatibility}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">{buddy.program} • {buddy.year}</p>
                <p className="text-sm text-muted-foreground">{buddy.location}</p>
              </div>

              <div>
                <p className="text-sm">{buddy.bio}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Interests:</p>
                <div className="flex flex-wrap gap-1">
                  {buddy.interests.slice(0, 3).map(interest => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {buddy.interests.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{buddy.interests.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
                <Button size="sm" variant="outline">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBuddies.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No buddies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new profiles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

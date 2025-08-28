import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Music, 
  Coffee, 
  Moon, 
  Sun, 
  Wifi, 
  Car, 
  UtensilsCrossed,
  Shield,
  Star,
  ArrowRight,
  Home
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    value: string;
    icon: React.ReactNode;
  }[];
}

interface QuizResult {
  personality: string;
  description: string;
  hostelTypes: string[];
  amenities: string[];
  icon: React.ReactNode;
  color: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How do you prefer to spend your evenings?",
    options: [
      { text: "Studying quietly in my room", value: "studious", icon: <BookOpen className="h-5 w-5" /> },
      { text: "Hanging out with friends in common areas", value: "social", icon: <Users className="h-5 w-5" /> },
      { text: "Listening to music and relaxing", value: "creative", icon: <Music className="h-5 w-5" /> },
      { text: "Going out to explore the city", value: "adventurous", icon: <Coffee className="h-5 w-5" /> }
    ]
  },
  {
    id: 2,
    question: "What's your ideal sleep schedule?",
    options: [
      { text: "Early bird - up at 6 AM", value: "early_bird", icon: <Sun className="h-5 w-5" /> },
      { text: "Night owl - up late studying", value: "night_owl", icon: <Moon className="h-5 w-5" /> },
      { text: "Flexible - depends on my schedule", value: "flexible", icon: <Star className="h-5 w-5" /> },
      { text: "Regular - 8 hours, consistent time", value: "regular", icon: <Home className="h-5 w-5" /> }
    ]
  },
  {
    id: 3,
    question: "What's most important to you in a living space?",
    options: [
      { text: "Peace and quiet for studying", value: "quiet", icon: <BookOpen className="h-5 w-5" /> },
      { text: "High-speed internet and tech amenities", value: "tech", icon: <Wifi className="h-5 w-5" /> },
      { text: "Kitchen facilities for cooking", value: "cooking", icon: <UtensilsCrossed className="h-5 w-5" /> },
      { text: "Security and safety features", value: "security", icon: <Shield className="h-5 w-5" /> }
    ]
  },
  {
    id: 4,
    question: "How do you prefer to get around?",
    options: [
      { text: "Walking or public transport", value: "public_transport", icon: <Users className="h-5 w-5" /> },
      { text: "I have my own car", value: "car", icon: <Car className="h-5 w-5" /> },
      { text: "Biking or scooter", value: "bike", icon: <ArrowRight className="h-5 w-5" /> },
      { text: "Close to campus - I'll walk everywhere", value: "walking", icon: <Home className="h-5 w-5" /> }
    ]
  },
  {
    id: 5,
    question: "What's your budget priority?",
    options: [
      { text: "Affordable - basic amenities are fine", value: "budget", icon: <Star className="h-5 w-5" /> },
      { text: "Mid-range - good balance of price and comfort", value: "balanced", icon: <Home className="h-5 w-5" /> },
      { text: "Premium - I want the best facilities", value: "premium", icon: <Shield className="h-5 w-5" /> },
      { text: "Flexible - depends on what's included", value: "flexible", icon: <Wifi className="h-5 w-5" /> }
    ]
  }
];

const quizResults: Record<string, QuizResult> = {
  studious: {
    personality: "The Scholar",
    description: "You value peace and quiet for focused studying. You prefer organized spaces with good lighting and minimal distractions.",
    hostelTypes: ["quiet zones", "study rooms", "single rooms"],
    amenities: ["Study rooms", "24/7 quiet hours", "Good lighting", "High-speed internet"],
    icon: <BookOpen className="h-6 w-6" />,
    color: "bg-blue-500"
  },
  social: {
    personality: "The Social Butterfly",
    description: "You love meeting new people and being part of a community. You thrive in environments with lots of social interaction.",
    hostelTypes: ["shared rooms", "common areas", "mixed gender"],
    amenities: ["Common lounges", "Social events", "Kitchen facilities", "Entertainment areas"],
    icon: <Users className="h-6 w-6" />,
    color: "bg-green-500"
  },
  creative: {
    personality: "The Creative Soul",
    description: "You need space for self-expression and artistic pursuits. You appreciate unique, inspiring environments.",
    hostelTypes: ["artistic spaces", "creative zones", "flexible layouts"],
    amenities: ["Art rooms", "Music practice areas", "Flexible spaces", "Creative workshops"],
    icon: <Music className="h-6 w-6" />,
    color: "bg-purple-500"
  },
  adventurous: {
    personality: "The Explorer",
    description: "You're always on the go and love discovering new places. You need a base that's well-connected and convenient.",
    hostelTypes: ["central location", "transportation hubs", "city access"],
    amenities: ["Bike storage", "Travel info", "Central location", "Transportation access"],
    icon: <Coffee className="h-6 w-6" />,
    color: "bg-orange-500"
  }
};

interface HostelPersonalityQuizProps {
  onComplete: (result: QuizResult) => void;
  onSkip: () => void;
}

export const HostelPersonalityQuiz: React.FC<HostelPersonalityQuizProps> = ({ onComplete, onSkip }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate result
      const result = calculateResult();
      setShowResult(true);
    }
  };

  const calculateResult = (): QuizResult => {
    // Simple scoring system - count occurrences of each personality type
    const scores: Record<string, number> = {};
    
    Object.values(answers).forEach(answer => {
      scores[answer] = (scores[answer] || 0) + 1;
    });

    // Get the most common personality type
    const dominantPersonality = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];

    return quizResults[dominantPersonality] || quizResults.studious;
  };

  const handleComplete = () => {
    const result = calculateResult();
    onComplete(result);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  if (showResult) {
    const result = calculateResult();
    return (
      <Card className="w-full max-w-2xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mb-4">Your Hostel Personality</CardTitle>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${result.color} text-white mb-4`}>
            {result.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{result.personality}</h3>
          <p className="text-muted-foreground mb-6">{result.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Recommended Hostel Types:</h4>
            <div className="flex flex-wrap gap-2">
              {result.hostelTypes.map((type, index) => (
                <Badge key={index} variant="secondary">{type}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Important Amenities:</h4>
            <div className="grid grid-cols-2 gap-2">
              {result.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleComplete} className="flex-1">
              Find My Perfect Hostel
            </Button>
            <Button variant="outline" onClick={onSkip}>
              Skip Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl">Find Your Perfect Hostel</CardTitle>
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip Quiz
          </Button>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {quizQuestions.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-6">{question.question}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="group h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleAnswer(question.id, option.value)}
              >
                <div className="text-primary group-hover:text-primary-foreground transition-colors">{option.icon}</div>
                <span className="text-sm">{option.text}</span>
              </Button>
            ))}
          </div>
        </div>
        {currentQuestion > 0 && (
          <Button variant="ghost" onClick={handleBack} className="w-full">
            ← Previous Question
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

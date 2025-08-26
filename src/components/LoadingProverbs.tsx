import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Heart, 
  Star, 
  Users, 
  Home,
  Lightbulb,
  Quote
} from 'lucide-react';

interface GhanaianProverb {
  proverb: string;
  meaning: string;
  category: string;
  icon: React.ReactNode;
}

const ghanaianProverbs: GhanaianProverb[] = [
  {
    proverb: "The child who has washed his hands can dine with kings.",
    meaning: "When you prepare yourself properly, you can achieve great things.",
    category: "Success",
    icon: <Star className="h-5 w-5" />
  },
  {
    proverb: "A single bracelet does not jingle.",
    meaning: "Unity and cooperation bring better results than working alone.",
    category: "Unity",
    icon: <Users className="h-5 w-5" />
  },
  {
    proverb: "The river flows not by its own power.",
    meaning: "We all need help and support from others to succeed.",
    category: "Support",
    icon: <Heart className="h-5 w-5" />
  },
  {
    proverb: "Knowledge is like a garden; if it is not cultivated, it cannot be harvested.",
    meaning: "Education and learning require continuous effort and dedication.",
    category: "Education",
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    proverb: "Home is where the heart is.",
    meaning: "Your true home is where you feel most comfortable and loved.",
    category: "Home",
    icon: <Home className="h-5 w-5" />
  },
  {
    proverb: "Wisdom is like a baobab tree; no one individual can embrace it.",
    meaning: "True wisdom comes from many sources and experiences.",
    category: "Wisdom",
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    proverb: "The eye never forgets what the heart has seen.",
    meaning: "Important experiences stay with us forever.",
    category: "Memory",
    icon: <Heart className="h-5 w-5" />
  },
  {
    proverb: "A family is like a forest; when you are outside it is dense, when you are inside you see that each tree has its place.",
    meaning: "Every member of a community has their unique role and value.",
    category: "Community",
    icon: <Users className="h-5 w-5" />
  },
  {
    proverb: "The best time to plant a tree was 20 years ago. The second best time is now.",
    meaning: "It's never too late to start working towards your goals.",
    category: "Opportunity",
    icon: <Star className="h-5 w-5" />
  },
  {
    proverb: "When you follow in the path of your father, you learn to walk like him.",
    meaning: "We learn from those who came before us and their experiences.",
    category: "Learning",
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    proverb: "The wealth of a nation is not in its banks, but in the hearts of its people.",
    meaning: "True wealth comes from the character and spirit of the people.",
    category: "Character",
    icon: <Heart className="h-5 w-5" />
  },
  {
    proverb: "A journey of a thousand miles begins with a single step.",
    meaning: "Every great achievement starts with taking the first step.",
    category: "Progress",
    icon: <Star className="h-5 w-5" />
  },
  {
    proverb: "The tongue and the teeth work together, yet they sometimes quarrel.",
    meaning: "Even the closest relationships have disagreements, but they work together.",
    category: "Relationships",
    icon: <Users className="h-5 w-5" />
  },
  {
    proverb: "He who does not know one thing knows another.",
    meaning: "Everyone has their own unique knowledge and skills.",
    category: "Individuality",
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    proverb: "The house of the head is not the house of the heart.",
    meaning: "Logic and emotions are different and both have their place.",
    category: "Balance",
    icon: <Heart className="h-5 w-5" />
  }
];

interface LoadingProverbsProps {
  message?: string;
  showProverb?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'simple';
}

export const LoadingProverbs: React.FC<LoadingProverbsProps> = ({
  message = "Loading...",
  showProverb = true,
  size = 'md',
  variant = 'card'
}) => {
  const [currentProverb, setCurrentProverb] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (!showProverb) return;

    const interval = setInterval(() => {
      setFadeState('out');
      
      setTimeout(() => {
        setCurrentProverb((prev) => (prev + 1) % ghanaianProverbs.length);
        setFadeState('in');
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [showProverb]);

  const proverb = ghanaianProverbs[currentProverb];

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (variant === 'simple') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`animate-spin rounded-full border-b-2 border-primary ${spinnerSizes[size]}`}></div>
        <p className={`text-muted-foreground ${sizeClasses[size]}`}>{message}</p>
        {showProverb && (
          <div className={`text-center max-w-md transition-opacity duration-500 ${fadeState === 'in' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {proverb.icon}
              <Badge variant="outline" className="text-xs">{proverb.category}</Badge>
            </div>
            <p className={`italic text-muted-foreground ${sizeClasses[size]}`}>
              "{proverb.proverb}"
            </p>
            <p className={`text-xs text-muted-foreground mt-1 ${sizeClasses[size]}`}>
              {proverb.meaning}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">
        <div className={`animate-spin rounded-full border-b-2 border-primary ${spinnerSizes[size]}`}></div>
        
        <div className="text-center">
          <p className={`font-medium ${sizeClasses[size]}`}>{message}</p>
        </div>

        {showProverb && (
          <div className={`text-center transition-opacity duration-500 ${fadeState === 'in' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Quote className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-xs">{proverb.category}</Badge>
            </div>
            
            <blockquote className={`italic text-muted-foreground mb-3 ${sizeClasses[size]}`}>
              "{proverb.proverb}"
            </blockquote>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              {proverb.icon}
              <p className={`text-xs text-muted-foreground ${sizeClasses[size]}`}>
                {proverb.meaning}
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-1">
          {ghanaianProverbs.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-1 rounded-full transition-colors duration-300 ${
                index === currentProverb ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Full-screen loading component
export const FullScreenLoading: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingProverbs 
        message={message} 
        showProverb={true} 
        size="lg" 
        variant="card" 
      />
    </div>
  );
};

// Inline loading component
export const InlineLoading: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <LoadingProverbs 
      message={message} 
      showProverb={false} 
      size="sm" 
      variant="simple" 
    />
  );
};

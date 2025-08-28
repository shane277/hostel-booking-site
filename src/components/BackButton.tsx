import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  fallbackPath?: string;
}

const BackButton = ({ 
  className = "fixed top-20 left-4 z-40", 
  variant = "ghost",
  fallbackPath = "/"
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if there's a previous page in the history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home page if no history
      navigate(fallbackPath);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleBack}
      className={className}
      title="Go back"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  );
};

export default BackButton;

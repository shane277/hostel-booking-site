import React, { useState } from 'react';
import { HostelPersonalityQuiz } from '../components/HostelPersonalityQuiz';
import { LoadingProverbs } from '../components/LoadingProverbs';
import { useNavigate } from 'react-router-dom';

interface QuizResult {
  personality: string;
  description: string;
  hostelTypes: string[];
  amenities: string[];
  icon: React.ReactNode;
  color: string;
}

const PersonalityQuiz: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(true);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
    setShowQuiz(false);
    setLoading(true);
    
    // Simulate loading time
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleSkipQuiz = () => {
    navigate('/search');
  };

  const handleFindHostels = () => {
    // Navigate to search with personality filters
    navigate('/search', { 
      state: { 
        personalityFilters: quizResult?.hostelTypes,
        amenities: quizResult?.amenities 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingProverbs 
          message="Finding your perfect hostel match..."
          showProverb={true}
          size="lg"
          variant="card"
        />
      </div>
    );
  }

  if (quizResult && !showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Perfect Match Found! 🎉
              </h1>
              <p className="text-lg text-gray-600">
                Based on your personality, we've identified the ideal hostel type for you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personality Result */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${quizResult.color} text-white mb-4`}>
                    {quizResult.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {quizResult.personality}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {quizResult.description}
                  </p>
                </div>
              </div>

              {/* Recommended Features */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  What to Look For
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Recommended Hostel Types:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {quizResult.hostelTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Important Amenities:
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {quizResult.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 text-center space-y-4">
              <button
                onClick={handleFindHostels}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Find My Perfect Hostels
              </button>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={handleSkipQuiz}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Browse All Hostels
                </button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Pro Tips for {quizResult.personality}s
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">1</span>
                    </div>
                    <p className="text-gray-700">
                      Read reviews carefully, especially from people with similar preferences
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">2</span>
                    </div>
                    <p className="text-gray-700">
                      Contact the hostel directly to ask about specific amenities
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">3</span>
                    </div>
                    <p className="text-gray-700">
                      Consider the location and proximity to your daily activities
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">4</span>
                    </div>
                    <p className="text-gray-700">
                      Book early to secure the best rooms and rates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Hostel Match
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take our quick personality quiz to discover hostels that match your lifestyle, 
            study habits, and preferences. Get personalized recommendations in just 2 minutes!
          </p>
        </div>

        <HostelPersonalityQuiz
          onComplete={handleQuizComplete}
          onSkip={handleSkipQuiz}
        />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Your answers help us match you with the perfect hostel experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalityQuiz;

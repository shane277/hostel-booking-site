import React from 'react';
import { HorrorStoriesContest } from '../components/HorrorStoriesContest';

const HorrorStories: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hostel Horror Stories Contest
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your wildest hostel experiences and compete for amazing prizes! 
            From funny mishaps to mysterious encounters, every story has a chance to win.
          </p>
        </div>

        <HorrorStoriesContest />
      </div>
    </div>
  );
};

export default HorrorStories;

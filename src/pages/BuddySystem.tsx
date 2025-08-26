import React from 'react';
import { HostelBuddySystem } from '../components/HostelBuddySystem';
import { LoadingProverbs } from '../components/LoadingProverbs';

const BuddySystem: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hostel Buddy System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with potential roommates who share your lifestyle, study habits, and preferences. 
            Find your perfect living partner and make your hostel experience even better!
          </p>
        </div>

        <HostelBuddySystem />
      </div>
    </div>
  );
};

export default BuddySystem;

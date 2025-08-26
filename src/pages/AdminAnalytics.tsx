import React from 'react';
import { AdminAnalytics } from '../components/AdminAnalytics';

const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <AdminAnalytics />
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

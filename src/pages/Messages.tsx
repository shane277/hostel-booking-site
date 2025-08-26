import React from 'react';
import { MessageCenter } from '@/components/MessageCenter';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Messages: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-2">
            Communicate directly with landlords and students
          </p>
        </div>
        
        <MessageCenter className="max-w-6xl mx-auto" />
      </div>
    </div>
  );
};

export default Messages;
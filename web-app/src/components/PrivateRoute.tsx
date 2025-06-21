import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('PrivateRoute状態:', { 
    user: !!user, 
    loading, 
    userEmail: user?.email || 'なし',
    デモユーザー: localStorage.getItem('demoUser') ? 'あり' : 'なし'
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};
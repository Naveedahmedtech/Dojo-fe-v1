import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { token, userInfo } = useAuth();
  
  if (!token) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && (!userInfo || !allowedRoles.includes(userInfo.role))) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
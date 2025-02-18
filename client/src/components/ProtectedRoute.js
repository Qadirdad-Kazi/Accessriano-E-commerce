import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Not logged in, redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && (!user || user.role !== 'admin')) {
    // User is not an admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

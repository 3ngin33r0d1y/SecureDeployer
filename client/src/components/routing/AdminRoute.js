import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

// Protected route component for admin users only
const AdminRoute = () => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  return isAuthenticated && user && user.role === 'admin' ? 
    <Outlet /> : 
    <Navigate to="/dashboard" />;
};

export default AdminRoute;

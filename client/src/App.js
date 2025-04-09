import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Layout Components (to be created)
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Dashboard Components (to be created)
import AdminDashboard from './components/admin/Dashboard';
import UserDashboard from './components/dashboard/Dashboard';
import UsersList from './components/admin/UsersList';
import ServicesList from './components/admin/ServicesList';
import DeploymentsList from './components/admin/DeploymentsList';
import DeploymentDetail from './components/admin/DeploymentDetail';
import UserServicesList from './components/dashboard/ServicesList';
import UserDeploymentsList from './components/dashboard/DeploymentsList';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="container-fluid py-4">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" />} />

              {/* Protected Routes for all authenticated users */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/services" element={<UserServicesList />} />
                <Route path="/deployments" element={<UserDeploymentsList />} />
              </Route>

              {/* Protected Routes for admin users only */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UsersList />} />
                <Route path="/admin/register" element={<Register />} />
                <Route path="/admin/services" element={<ServicesList />} />
                <Route path="/admin/deployments" element={<DeploymentsList />} />
                <Route path="/admin/deployments/:id" element={<DeploymentDetail />} />
              </Route>
            </Routes>
          </div>
          <Footer />
        </Router>
      </AuthProvider>
  );
}

export default App;

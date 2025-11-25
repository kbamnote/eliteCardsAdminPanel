import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/pages/auth/Login';
import Dashboard from './components/pages/dashboard/Dashboard';
import Register from './components/pages/register/Register';
import AllClients from './components/pages/clients/AllClients';
import ViewClientDetails from './components/pages/clients/ViewClientDetails';
import MailPage from './components/pages/mail/Mail';
import MailTracking from './components/pages/mail/MailTracking';
import Layout from './components/common/Layout';
import './App.css';
import Cookies from 'js-cookie';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = Cookies.get('token');
  const userRole = Cookies.get('userRole');
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If allowedRoles is specified and userRole is not in allowedRoles, redirect to appropriate page
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // For other roles, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirect to appropriate page if already logged in)
const PublicRoute = ({ children }) => {
  const token = Cookies.get('token');
  const userRole = Cookies.get('userRole');
  
  if (token) {
    // For admin role, redirect to dashboard
    if (userRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    // For other roles, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Login route - redirect to appropriate page if already authenticated */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes with layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/all-clients" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AllClients />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/client/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <ViewClientDetails />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <Register />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/mail" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <MailPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/mail-tracking" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <MailTracking />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route - redirect to appropriate page */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
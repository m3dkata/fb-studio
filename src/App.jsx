import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import InstallPrompt from './components/InstallPrompt';
import OfflineDetector from './components/OfflineDetector';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import BookServicePage from './pages/user/BookServicePage';
import MyBookingsPage from './pages/user/MyBookingsPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageServicesPage from './pages/admin/ManageServicesPage';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';
import ManageSlotsPage from './pages/admin/ManageSlotsPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <InstallPrompt />
          <OfflineDetector />
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/:id" element={<ServiceDetailPage />} />

              {/* Protected User Routes */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="book/:id" element={
                <ProtectedRoute>
                  <BookServicePage />
                </ProtectedRoute>
              } />
              <Route path="my-bookings" element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              {/* Protected Admin Routes */}
              <Route path="admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/services" element={
                <ProtectedRoute adminOnly>
                  <ManageServicesPage />
                </ProtectedRoute>
              } />
              <Route path="admin/bookings" element={
                <ProtectedRoute adminOnly>
                  <ManageBookingsPage />
                </ProtectedRoute>
              } />
              <Route path="admin/slots" element={
                <ProtectedRoute adminOnly>
                  <ManageSlotsPage />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

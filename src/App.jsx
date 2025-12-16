import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { USER_TYPES } from './constants/userTypes';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import InstallPrompt from './components/InstallPrompt';
import ErrorBoundary from './components/ErrorBoundary';

import ChatWidget from './components/ui/ChatWidget';
import AdminChatWidget from './components/ui/AdminChatWidget';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuth } from './hooks/useAuth';

// Code splitting: Lazy load page components
// Public Pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/public/ServiceDetailPage'));
const MakeupStudio = lazy(() => import('./pages/public/MakeupStudio'));

// User Pages
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const BookServicePage = lazy(() => import('./pages/user/BookServicePage'));
const MyBookingsPage = lazy(() => import('./pages/user/MyBookingsPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageServicesPage = lazy(() => import('./pages/admin/ManageServicesPage'));
const ManageBookingsPage = lazy(() => import('./pages/admin/ManageBookingsPage'));
const ManageSlotsPage = lazy(() => import('./pages/admin/ManageSlotsPage'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && window.OneSignal) {
      if (user) {
        window.OneSignal.login(user.id);
      } else {
        window.OneSignal.logout();
      }
    }

    return () => {
      if (window.OneSignal && user) {
        window.OneSignal.logout();
      }
    };
  }, [user, loading]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Router>
      <InstallPrompt />

      {user && (user.user_type === USER_TYPES.ADMIN ? <AdminChatWidget /> : <ChatWidget />)}
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="tryon" element={<MakeupStudio />} />

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
      </Suspense>
    </Router>
  );
}

export default App;

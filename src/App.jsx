import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Lazy imports
const AuthPage      = lazy(() => import('./pages/AuthPage'));
const PaymentPage   = lazy(() => import('./pages/PaymentPage'));
const ResultPage    = lazy(() => import('./pages/ResultPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

const LandingPage      = lazy(() => import('./pages/LandingPage'));
const EventsPage       = lazy(() => import('./pages/EventsPage'));
const EventDetailsPage = lazy(() => import('./pages/EventDetailsPage'));
const RegisterPage     = lazy(() => import('./pages/RegisterPage'));

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { BookingProvider } from './context/BookingContext';
import ErrorBoundary from './components/ErrorBoundary';

const PageLoader = () => <div className="p-10">Loading...</div>;

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <BookingProvider>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Router>
                <Routes>

                  {/* AUTH (NO LAYOUT) */}
                  <Route path="/auth" element={<AuthPage />} />

                  {/* PUBLIC PAGES (NO LAYOUT) */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailsPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* PROTECTED PAGES (WITH LAYOUT ONLY HERE) */}
                  <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/result" element={<ResultPage />} />
                  </Route>

                  {/* FALLBACK */}
                  <Route path="*" element={<Navigate to="/auth" replace />} />

                </Routes>
              </Router>

              <Toaster richColors />
            </Suspense>
          </ErrorBoundary>
        </BookingProvider>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;
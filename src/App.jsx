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

const AdminDashboardPage  = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminEventsPage     = lazy(() => import('./pages/admin/AdminEventsPage'));
const AdminOrganizersPage = lazy(() => import('./pages/admin/AdminOrganizersPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));

const OrganizerDashboardPage = lazy(() => import('./pages/organizer/OrganizerDashboardPage'));
const OrganizerEventsPage    = lazy(() => import('./pages/organizer/OrganizerEventsPage'));

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

                  {/* AUTHENTICATED ROUTES (ANY ROLE) */}
                  <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/events/:id" element={<EventDetailsPage />} />
                  </Route>

                  {/* ATTENDEE ONLY */}
                  <Route element={<ProtectedRoute requiredRole="attendee"><Layout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/result" element={<ResultPage />} />
                  </Route>

                  {/* ORGANIZER ONLY */}
                  <Route element={<ProtectedRoute requiredRole="organizer"><Layout /></ProtectedRoute>}>
                    <Route path="/organizer/dashboard" element={<OrganizerDashboardPage />} />
                    <Route path="/organizer/events" element={<OrganizerEventsPage />} />
                  </Route>

                  {/* ADMIN ONLY */}
                  <Route element={<ProtectedRoute requiredRole="admin"><Layout /></ProtectedRoute>}>
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/admin/events" element={<AdminEventsPage />} />
                    <Route path="/admin/organizers" element={<AdminOrganizersPage />} />
                    <Route path="/admin/categories" element={<AdminCategoriesPage />} />
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
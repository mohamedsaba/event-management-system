import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AuthContext } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// A fake Dashboard component to see if we got let inside
const MockDashboard = () => <div>Welcome to the Dashboard</div>;
// A fake Auth page to see if we got kicked out
const MockAuthPage = () => <div>Please Sign In</div>;

describe('ProtectedRoute Security Rules', () => {

  it('Kicks unauthenticated users back to /auth', () => {
    render(
      // Simulate no user logged in
      <AuthContext.Provider value={{ user: null }}>
        {/* Simulate the user typing "/dashboard" into the URL bar */}
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/auth" element={<MockAuthPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MockDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // EXPECTATION: We should see the Auth page, NOT the Dashboard
    expect(screen.getByText('Please Sign In')).toBeInTheDocument();
    expect(screen.queryByText('Welcome to the Dashboard')).not.toBeInTheDocument();
  });

  it('Allows authenticated users to view the Dashboard', () => {
    render(
      // Simulate a user IS logged in
      <AuthContext.Provider value={{ user: { name: 'Admin', email: 'admin@test.com' } }}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/auth" element={<MockAuthPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MockDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // EXPECTATION: We should see the Dashboard
    expect(screen.getByText('Welcome to the Dashboard')).toBeInTheDocument();
  });

});
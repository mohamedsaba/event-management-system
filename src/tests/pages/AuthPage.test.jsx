import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import AuthPage from '@/pages/AuthPage';

describe('AuthPage UI & Interaction', () => {
  // A fake mock of the login function so we can see if the form tries to call it
  const mockLogin = vi.fn();

  const renderAuthPage = () => {
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('renders the sign in form by default', () => {
    renderAuthPage();
    // Check that the core form elements exist on the screen
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('updates input fields when typed into', () => {
    renderAuthPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });
});
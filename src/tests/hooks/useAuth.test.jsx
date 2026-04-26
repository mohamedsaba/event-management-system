import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from '@/context/AuthContext';

// Helper to access the context inside the test
const useAuth = () => useContext(AuthContext);

describe('Auth Context Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with a null user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.user).toBeNull();
  });

  it('updates state and localStorage on login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    act(() => {
      result.current.login('Admin', 'admin@test.com');
    });

    expect(result.current.user).toEqual({ name: 'Admin', email: 'admin@test.com' });
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ name: 'Admin', email: 'admin@test.com' });
  });

  it('clears state and localStorage on logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    // Log in first
    act(() => { result.current.login('Admin', 'admin@test.com'); });
    
    // Then log out
    act(() => { result.current.logout(); });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
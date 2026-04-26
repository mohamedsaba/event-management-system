import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Crash protection: Warns you immediately if you forget the Provider in App.jsx
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
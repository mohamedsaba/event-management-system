import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useIdleTimer = (timeoutMinutes = 15) => {
  const { logout, user } = useAuth();

  useEffect(() => {
    // Only run the timer if someone is actually logged in
    if (!user) return; 

    let timeoutId;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        toast.error("You have been securely logged out due to inactivity.");
      }, timeoutMs);
    };

    // Listen to normal human activities
    const events = ['mousemove', 'keydown', 'wheel', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Start the clock on mount

    // Cleanup when component unmounts
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, logout, timeoutMinutes]);
};
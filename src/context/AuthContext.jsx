import { createContext, useState, useEffect } from 'react';
import { authApi } from '@/utils/api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount — try refresh token first, fallback to getMe
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedRefreshToken = localStorage.getItem("refreshToken");
        const savedToken = localStorage.getItem("token");

        if (savedRefreshToken) {
          // Try to refresh the access token using the refresh token
          try {
            const response = await authApi.refreshToken(savedRefreshToken);
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem("token", response.token);
            if (response.refreshToken) {
              localStorage.setItem("refreshToken", response.refreshToken);
            }
            localStorage.setItem("user", JSON.stringify(response.user));
            return; // Success — no need to try getMe
          } catch (refreshError) {
            console.warn("Refresh token expired, trying access token...", refreshError);
          }
        }

        // Fallback: if we have a saved access token, try getMe
        if (savedToken) {
          console.log("AuthContext: Restoring session with token...");
          setToken(savedToken);
          const userData = await authApi.getMe();
          console.log("AuthContext: restoreSession success:", userData);
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("AuthContext: Failed to restore session:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("AuthContext: Attempting login for:", email);
      const response = await authApi.login({ email, password });
      const { token: newToken, refreshToken: newRefreshToken, user: userData } = response;
      
      console.log("AuthContext: Login successful, setting user:", userData);
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem("token", newToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      localStorage.setItem("user", JSON.stringify(userData));
      
      return response;
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      throw error;
    }
  };

  const signup = async (data) => {
    try {
      const response = await authApi.register(data);
      const { token: newToken, refreshToken: newRefreshToken, user: userData } = response;
      
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem("token", newToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      localStorage.setItem("user", JSON.stringify(userData));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
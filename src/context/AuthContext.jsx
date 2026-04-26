import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage so it persists on refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (name, email) => {
    const userData = { name, email };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Save it!
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Clear it!
  };

  const updateUser = (updatedData) => {
    // Merge the old user data with the new changes
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout , updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
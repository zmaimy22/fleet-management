import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Try to get users from API first
      const users = await getUsers();
      
      if (!users || !Array.isArray(users)) {
        throw new Error('No users data');
      }
      
      // Find user
      const foundUser = users.find(
        u => u.username === username && u.password === password
      );

      if (foundUser) {
        // Don't store password in session
        const userSession = {
          id: foundUser.id,
          username: foundUser.username,
          name: foundUser.name,
          role: foundUser.role,
          driverId: foundUser.driverId // For drivers, link to driver ID
        };
        
        setUser(userSession);
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        return { success: true };
      }

      return { success: false, error: 'Usuario o contraseña incorrectos' };
    } catch (error) {
      console.error('Failed to get users from API:', error);
      
      // Fallback to localStorage
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find user
        const foundUser = users.find(
          u => u.username === username && u.password === password
        );

        if (foundUser) {
          // Don't store password in session
          const userSession = {
            id: foundUser.id,
            username: foundUser.username,
            name: foundUser.name,
            role: foundUser.role,
            driverId: foundUser.driverId // For drivers, link to driver ID
          };
          
          setUser(userSession);
          localStorage.setItem('currentUser', JSON.stringify(userSession));
          return { success: true };
        }

        return { success: false, error: 'Usuario o contraseña incorrectos' };
      } catch (e) {
        return { success: false, error: 'Error al procesar el login' };
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isDriver = () => {
    return user?.role === 'driver';
  };

  const value = {
    user,
    login,
    logout,
    isAdmin,
    isDriver,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

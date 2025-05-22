import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to validate user data
  const validateUserData = (userData) => {
    if (!userData || !userData._id) {
      console.error('Invalid user data:', userData);
      return false;
    }
    return true;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log('Initial auth check - Token:', token);
        console.log('Initial auth check - User data:', userData);
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('Parsed user data:', parsedUser);
            
            if (validateUserData(parsedUser)) {
              console.log('Setting initial user:', parsedUser);
              setUser(parsedUser);
            } else {
              console.log('Invalid user data, clearing storage');
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } else {
          console.log('No token or user data found');
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      console.log('AuthContext: Attempting login');
      const data = await auth.login(username, password);
      console.log('AuthContext: Login response:', data);
      
      if (data.token && data.user && validateUserData(data.user)) {
        console.log('AuthContext: Storing user data:', data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid login response' };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (username, password) => {
    try {
      console.log('AuthContext: Attempting registration');
      const data = await auth.register(username, password);
      console.log('AuthContext: Register response:', data);
      
      if (data.token && data.user && validateUserData(data.user)) {
        console.log('AuthContext: Storing user data:', data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid registration response' };
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out, clearing user data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
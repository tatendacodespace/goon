import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Example: Check for user in localStorage or make an API call
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Example login function
  const login = async (username, password) => {
    // Call the backend API
    const response = await import('../services/api').then(m => m.auth.login(username, password));
    // response should be { token, user }
    if (!response.token || typeof response.token !== 'string' || response.token.split('.').length !== 3) {
      console.warn('Received invalid or malformed token:', response.token);
      throw new Error('Login failed: Invalid token received from server.');
    }
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
    return response;
  };

  // Example logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
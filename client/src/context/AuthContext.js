import React, { useState, useEffect, createContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        setAuthToken(localStorage.token);
      }
      
      try {
        const res = await axios.get('/api/auth/me');
        
        setUser(res.data.user);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/register', formData);
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/login', formData);
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    
    setUser(null);
    setIsAuthenticated(false);
  };

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

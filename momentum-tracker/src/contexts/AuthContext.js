import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState(localStorage.getItem('momentum_api_key'));

  useEffect(() => {
    if (apiKey) {
      apiClient.setApiKey(apiKey);
      loadUser();
    } else {
      setLoading(false);
    }
  }, [apiKey]);

  const loadUser = async () => {
    try {
      const response = await apiClient.getUser();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Invalid API key, remove it
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiClient.login(email, password);
      
      const apiKey = response.user.apiKey;
      apiClient.setApiKey(apiKey);
      
      setApiKey(apiKey);
      setUser(response.user);
      localStorage.setItem('momentum_api_key', apiKey);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setApiKey(null);
    localStorage.removeItem('momentum_api_key');
    apiClient.setApiKey(null);
  };

  const createAccount = async (email, password) => {
    try {
      const response = await apiClient.createUser(email, password);
      return { 
        success: true, 
        user: response.user
      };
    } catch (error) {
      console.error('Account creation failed:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    apiKey,
    isAuthenticated: !!user,
    login,
    logout,
    createAccount,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
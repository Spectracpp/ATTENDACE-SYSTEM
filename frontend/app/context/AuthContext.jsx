'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to get user from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
          localStorage.removeItem('user');
        }
      }

      // Then verify with server
      const response = await axios.get('/api/auth/check', {
        // Add timeout to prevent long-hanging requests
        timeout: 5000
      });
      
      if (response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // Clear user data if server says not authenticated
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Don't clear user on network errors if we already have a user
      // This prevents logout on temporary network issues
      if (error.response?.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role = 'user') => {
    try {
      setLoading(true);
      
      // Validate role
      if (!['user', 'admin'].includes(role)) {
        throw new Error('Invalid role specified');
      }

      console.log('Login attempt:', { email, role });
      
      const response = await axios.post('/api/auth/login', { 
        email, 
        password, 
        role 
      });

      const userData = response.data.user;
      
      // Verify that the returned user has the correct role
      if (userData.role !== role) {
        throw new Error(`Account role mismatch. Expected ${role} but got ${userData.role}`);
      }

      // Store token separately for API requests
      if (userData.token) {
        localStorage.setItem('auth', JSON.stringify({ token: userData.token }));
      }

      setUser(userData);
      setIsAuthenticated(true);

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirect based on role
      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any existing user data
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('auth');
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('auth');
      router.push('/auth/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
      
      // Force logout on the client side even if the server request fails
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('auth');
      router.push('/auth/login');
    }
  };

  const updateUser = (userData) => {
    // Preserve the token if it exists in the current user but not in the updated data
    if (user?.token && !userData.token) {
      userData.token = user.token;
    }
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update auth storage if token is present
    if (userData.token) {
      localStorage.setItem('auth', JSON.stringify({ token: userData.token }));
    }
  };

  const updateActiveOrganization = (organization) => {
    if (user) {
      const updatedUser = {
        ...user,
        activeOrganization: organization
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    updateActiveOrganization
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

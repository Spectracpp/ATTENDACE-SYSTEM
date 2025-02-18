'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('AuthProvider mounted, checking auth...');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('Checking auth status...');
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      console.log('Auth check response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth check successful, user:', data.user);
        setUser(data.user);
      } else {
        console.log('Auth check failed, clearing user');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    console.log('Attempting login...');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Setting user data:', data.user);
      setUser(data.user);
      toast.success('Login successful!');

      // Use router.replace instead of push to avoid navigation issues
      if (data.user.role === 'admin') {
        console.log('Redirecting to admin dashboard...');
        router.replace('/admin/dashboard');
      } else {
        console.log('Redirecting to user dashboard...');
        router.replace('/dashboard');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Registration successful! Please login.');
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      toast.success('Logged out successfully');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  console.log('AuthContext current state:', { user, loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

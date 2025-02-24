'use client';

import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

// List of public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/login/user',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/verify-email'
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const isPublicRoute = (path) => {
    return PUBLIC_ROUTES.some(route => path.startsWith(route));
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
        // Only redirect to login if not on a public route
        const currentPath = window.location.pathname;
        if (!isPublicRoute(currentPath)) {
          router.push('/auth/login');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      // Only redirect to login if not on a public route
      const currentPath = window.location.pathname;
      if (!isPublicRoute(currentPath)) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        toast.success('Login successful!');
        router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        toast.success('Logged out successfully');
        // Force navigation to home page
        window.location.href = '/';
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Please login.');
        router.push('/auth/login');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

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
    try {
      console.log('Checking authentication...');
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log('Auth check failed:', response.status);
        setUser(null);
        // Only redirect if we're on a protected route
        const path = window.location.pathname;
        if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
          router.replace('/auth/login/user');
        }
        return;
      }

      const data = await response.json();
      console.log('Auth check response:', data);
      
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
        // Only redirect if we're on a protected route
        const path = window.location.pathname;
        if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
          router.replace('/auth/login/user');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    console.log('Attempting login...', { email, role });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login response:', { success: data.success });

      setUser(data.user);
      toast.success('Login successful!');

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      router.replace('/auth/login/user');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  const register = async (userData) => {
    try {
      const { role, confirmPassword, ...registrationData } = userData;
      
      // Validate required fields before making the request
      const requiredFields = ['name', 'email', 'password', 'phone'];
      if (role === 'user') {
        requiredFields.push('studentId', 'course', 'semester', 'department');
      } else if (role === 'admin') {
        requiredFields.push('organizationName');
      }

      const missingFields = requiredFields.filter(field => !registrationData[field]?.trim());
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...registrationData, role }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration response:', { success: data.success });

      toast.success('Registration successful! Please log in.');
      router.replace(`/auth/login/${role}`);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

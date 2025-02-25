'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/lib/api/auth';
import toast from 'react-hot-toast';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get stored auth data
        const storedAuth = localStorage.getItem('auth');
        if (!storedAuth) {
          setLoading(false);
          return;
        }

        const { user: storedUser } = JSON.parse(storedAuth);
        
        // Set initial user state from storage
        setUser(storedUser);
        
        // Verify token with backend
        const { success, user: verifiedUser } = await checkAuth();
        
        if (success && verifiedUser) {
          setUser(verifiedUser);
        } else {
          // Clear invalid auth data
          localStorage.removeItem('auth');
          setUser(null);
          
          // Only redirect if we're on a protected route
          const path = window.location.pathname;
          if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
            router.replace('/auth/login/user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [router]);

  const updateAuthState = (userData, token) => {
    if (userData && token) {
      localStorage.setItem('auth', JSON.stringify({ user: userData, token }));
      setUser(userData);
    } else {
      localStorage.removeItem('auth');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    updateAuthState,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

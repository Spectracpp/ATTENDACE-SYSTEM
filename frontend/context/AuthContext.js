'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // If token is invalid, clear it from both storages
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { token, user: userData } = await response.json();
      
      // Store token based on remember me preference
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data = await response.json();
      
      // Redirect to email verification page if required
      if (data.requiresEmailVerification) {
        router.push('/auth/verify-email?email=' + encodeURIComponent(userData.email));
      }
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const verifyEmail = async (token) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Email verification failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resend verification email');
      }

      return await response.json();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request password reset');
      }

      return await response.json();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset failed');
      }

      return await response.json();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error,
        login, 
        signup, 
        logout,
        verifyEmail,
        resendVerificationEmail,
        requestPasswordReset,
        resetPassword,
        checkUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

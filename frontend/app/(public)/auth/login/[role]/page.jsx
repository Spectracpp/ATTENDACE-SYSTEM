'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { LogoWithText } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const params = useParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get role from URL parameter
  const role = params?.role;

  useEffect(() => {
    // Validate role
    if (!role || !['user', 'admin'].includes(role)) {
      toast.error('Invalid role specified');
      router.replace('/auth/login/user');
    }
  }, [role, router]);

  const validateForm = () => {
    const errors = [];
    
    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Invalid email format');
    }

    if (!formData.password) {
      errors.push('Password is required');
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setLoading(true);

    try {
      // Get role from URL parameter and validate it
      if (!role || !['user', 'admin'].includes(role)) {
        throw new Error('Invalid role specified');
      }

      console.log('Attempting login with:', {
        email: formData.email,
        role: role
      });

      await login(formData.email.trim().toLowerCase(), formData.password, role);

      // Clear form data
      setFormData({
        email: '',
        password: ''
      });

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0D1117]">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[45%] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center">
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-8">
            <LogoWithText className="h-12 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-3">
              {role === 'admin' ? 'Admin Login' : 'Student Login'}
            </h1>
            <div className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link 
                href={`/auth/register/${role}`} 
                className="text-[#00f2ea] hover:text-[#00d8d8]"
              >
                Sign Up
              </Link>
              {' | '}
              <Link 
                href={`/auth/login/${role === 'admin' ? 'user' : 'admin'}`}
                className="text-[#00f2ea] hover:text-[#00d8d8]"
              >
                {role === 'admin' ? 'Student Login' : 'Admin Login'}
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="block w-full pl-11 pr-4 py-3 bg-[#161B22] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f2ea] focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="block w-full pl-11 pr-4 py-3 bg-[#161B22] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f2ea] focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-[#00f2ea] bg-[#161B22] border-gray-700 rounded focus:ring-[#00f2ea]"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[#00f2ea] hover:text-[#00d8d8]"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-[#00f2ea] hover:bg-[#00d8d8] text-black font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00f2ea] ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-[55%] bg-[#161B22]">
        <div className="h-full flex items-center justify-center p-12">
          <div className="max-w-xl text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              {role === 'admin' 
                ? 'Manage Your Organization' 
                : 'Track Your Attendance'}
            </h2>
            <p className="text-gray-400 text-lg">
              {role === 'admin'
                ? 'Access your dashboard to manage attendance, view reports, and oversee your organization.'
                : 'Stay on top of your attendance records and maintain a great academic record.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

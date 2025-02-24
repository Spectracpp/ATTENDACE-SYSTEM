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
    <div className="min-h-screen flex bg-black/90 relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute inset-0 animated-bg"></div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-[45%] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center relative z-10">
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-8">
            <LogoWithText className="h-12 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-3">
              <span className="cyberpunk-text-gradient">
                {role === 'admin' ? 'Admin' : 'Student'}
              </span>{' '}
              <span className="text-white">Login</span>
            </h1>
            <div className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link 
                href={`/auth/register/${role}`} 
                className="text-[#ff0080] hover:text-[#ff0080]/80 transition-colors"
              >
                Sign Up
              </Link>
              {' | '}
              <Link 
                href={`/auth/login/${role === 'admin' ? 'user' : 'admin'}`}
                className="text-[#ff0080] hover:text-[#ff0080]/80 transition-colors"
              >
                {role === 'admin' ? 'Student Login' : 'Admin Login'}
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 cyberpunk-card border-red-500/50 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-[#ff0080]" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="block w-full pl-11 pr-4 py-3 bg-black/50 backdrop-blur-xl border border-[#ff0080]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff0080] focus:ring-1 focus:ring-[#ff0080] transition-colors"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-[#ff0080]" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="block w-full pl-11 pr-4 py-3 bg-black/50 backdrop-blur-xl border border-[#ff0080]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff0080] focus:ring-1 focus:ring-[#ff0080] transition-colors"
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400 cursor-pointer group">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 border-[#ff0080]/20 bg-black/50 rounded text-[#ff0080] focus:ring-[#ff0080] transition-colors"
                />
                <span className="ml-2 group-hover:text-white transition-colors">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[#ff0080] hover:text-[#ff0080]/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyberpunk-button w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent z-10"></div>
        <div className="h-full flex items-center justify-center p-12 relative z-20">
          <div className="max-w-xl text-center">
            <h2 className="text-5xl font-bold mb-6">
              <span className="cyberpunk-text-gradient">
                {role === 'admin' ? 'Manage' : 'Track'}
              </span>{' '}
              <span className="text-white">Your</span>{' '}
              <span className="cyberpunk-text-gradient">
                {role === 'admin' ? 'Organization' : 'Attendance'}
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              {role === 'admin'
                ? 'Take control of your organization\'s attendance with our powerful management tools.'
                : 'Earn rewards and maintain perfect attendance streaks with our gamified system.'}
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: '🎯', label: 'Track Goals' },
                { icon: '💰', label: 'Earn Rewards' },
                { icon: '📊', label: 'View Analytics' },
              ].map((item, index) => (
                <div key={index} className="cyberpunk-card p-4 group hover:scale-105 transition-transform">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div className="text-sm text-gray-400 group-hover:text-white transition-colors">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

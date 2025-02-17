'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-medium text-[#00f2ea] hover:text-[#00d8d8]">
                Sign up
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="rounded-md shadow-sm space-y-4">
              <div className="relative">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 px-3 py-2 border border-gray-800 bg-black/50 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 px-3 py-2 border border-gray-800 bg-black/50 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#00f2ea] focus:ring-[#00f2ea] border-gray-800 rounded bg-black/50"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-[#00f2ea] hover:text-[#00d8d8]">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-[#00f2ea] hover:bg-[#00d8d8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00f2ea] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image/Animation */}
      <div className="hidden lg:flex flex-1 relative bg-black items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ea]/20 via-black to-[#6366f1]/20" />
        <div className="relative z-10 p-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-4">AttendEase</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Transform your daily attendance into valuable rewards. Earn tokens, maintain streaks, and redeem for exciting perks.
          </p>
        </div>
      </div>
    </div>
  );
}

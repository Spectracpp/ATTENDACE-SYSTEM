'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoWithText } from '../../../../components/Logo';
import RoleSwitcher from '../../../../components/Auth/RoleSwitcher';
import { useAuth } from '../../../context/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function LoginPage({ params }) {
  const router = useRouter();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const isAdmin = params.role === 'admin';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(formData.email, formData.password, true);
      
      if (userData.role !== params.role) {
        throw new Error(`Invalid login. Please use the ${params.role} login page.`);
      }

      toast.success('Login successful!');
      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <div className="min-h-screen flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-black">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 relative mb-8">
                <LogoWithText height={60} animated={false} />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white">
                {isAdmin ? 'Admin Login' : 'User Login'}
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                {isAdmin ? 'Access your admin dashboard' : 'Welcome back! Please sign in to continue'}
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
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
                      className="appearance-none relative block w-full pl-10 px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] transition-colors"
                      placeholder="Email address"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
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
                      className="appearance-none relative block w-full pl-10 px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] transition-colors"
                      placeholder="Password"
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-[#00f2ea] hover:bg-[#00d8d8] transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="flex flex-col space-y-3 text-sm text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link
                  href={isAdmin ? '/auth/register/admin' : '/auth/register'}
                  className="text-[#00f2ea] hover:text-[#00d8d8] transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <RoleSwitcher currentRole={params.role} currentPage="login" />
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block relative w-0 flex-1">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={isAdmin ? "/images/admin-login-bg.jpg" : "/images/user-login-bg.jpg"}
            alt="Login background"
          />
        </div>
      </div>
    </>
  );
}

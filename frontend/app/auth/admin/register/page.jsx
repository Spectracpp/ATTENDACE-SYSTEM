'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogoWithText } from '../../../../components/Logo';
import RoleSwitcher from '../../../../components/Auth/RoleSwitcher';
import toast from 'react-hot-toast';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, role: 'admin' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Admin registration successful! Please log in.');
      router.push('/auth/login/admin');
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <LogoWithText height={60} animated={true} />
              <h2 className="mt-6 text-3xl font-bold text-white">
                Create Admin Account
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Register as an administrator to manage AttendEase
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label htmlFor="name" className="sr-only">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="sr-only">
                    Department
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] focus:z-10 sm:text-sm"
                    placeholder="Department"
                  />
                </div>
                <div>
                  <label htmlFor="adminCode" className="sr-only">
                    Admin Code
                  </label>
                  <input
                    id="adminCode"
                    name="adminCode"
                    type="text"
                    required
                    value={formData.adminCode}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] focus:z-10 sm:text-sm"
                    placeholder="Admin Registration Code"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-[#00f2ea] focus:border-[#00f2ea] focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-[#00f2ea] hover:bg-[#00d8d8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00f2ea] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Create Admin Account'}
                </button>
              </div>

              <div className="flex flex-col space-y-3 text-sm text-center">
                <p className="text-gray-400">
                  Already have an admin account?{' '}
                  <Link
                    href="/auth/login/admin"
                    className="text-[#00f2ea] hover:text-[#00d8d8] transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.form>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('/admin-register-bg.jpg')] bg-cover bg-center" />
        </div>
      </div>
      <RoleSwitcher currentRole="admin" currentPage="register" />
    </>
  );
}

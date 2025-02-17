'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, role: 'admin' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.user.role !== 'admin') {
        throw new Error('Unauthorized. Admin access only.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('userId', data.user.id);

      toast.success('Login successful!');
      router.push('/admin/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Left Side - Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md space-y-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-main/20 to-secondary-main/20 blur-3xl -z-10" />
          
          <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mx-auto h-24 w-24 relative mb-8">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-main to-secondary-main">
                Admin Login
              </h2>
              <p className="text-sm text-gray-400">
                Not an admin?{' '}
                <Link href="/auth/login" className="font-medium text-primary-main hover:text-primary-hover transition-colors">
                  User Login
                </Link>
              </p>
            </motion.div>

            <motion.form
              className="mt-8 space-y-6"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400 group-focus-within:text-primary-main transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input pl-10 bg-gray-800/50 border-gray-700 focus:border-primary-main focus:ring-primary-main/50 rounded-xl"
                    placeholder="Admin email"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-main transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pl-10 bg-gray-800/50 border-gray-700 focus:border-primary-main focus:ring-primary-main/50 rounded-xl"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div className="text-sm text-right">
                <Link href="/auth/forgot-password" className="font-medium text-primary-main hover:text-primary-hover transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`
                  relative w-full px-4 py-3 text-sm font-medium rounded-xl
                  bg-gradient-to-r from-primary-main to-secondary-main
                  hover:from-primary-hover hover:to-secondary-hover
                  text-black transition-all duration-200 transform hover:scale-[1.02]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  focus:outline-none focus:ring-2 focus:ring-primary-main/50 focus:ring-offset-2 focus:ring-offset-gray-900
                `}
              >
                <span className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <FaUserShield className="w-5 h-5 mr-2" />
                      Admin Sign in
                    </>
                  )}
                </span>
              </button>
            </motion.form>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Image */}
      <motion.div
        className="hidden lg:block relative w-1/2"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-main/20 via-transparent to-secondary-main/20" />
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/auth-bg.jpg"
          alt="Authentication background"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 to-black/20" />
        
        <div className="relative h-full flex items-center justify-center p-16">
          <div className="text-center max-w-xl">
            <motion.h1 
              className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-main to-secondary-main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Admin Dashboard Access
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Manage your organization's attendance system with powerful admin controls.
              Secure, efficient, and easy to use.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

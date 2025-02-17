'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaIdCard, FaGraduationCap } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function UserRegister() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    studentId: '',
    course: ''
  });
  const [error, setError] = useState('');
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
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register({
        ...formData,
        role: 'user'
      });
      router.push('/auth/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
                Student Registration
              </h2>
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-primary-main hover:text-primary-hover transition-colors">
                  Sign in
                </Link>
                <span className="mx-2">|</span>
                <Link href="/auth/register/admin" className="font-medium text-primary-main hover:text-primary-hover transition-colors">
                  Admin Registration
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
              {error && (
                <motion.div
                  className="bg-error-light/10 border border-error-main text-error-main px-4 py-3 rounded-xl relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="block sm:inline">{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400 group-focus-within:text-primary-main transition-colors" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input pl-10 bg-gray-800/50 border-gray-700 focus:border-primary-main focus:ring-primary-main/50 rounded-xl"
                    placeholder="Full name"
                  />
                </div>

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
                    placeholder="Email address"
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pl-10 bg-gray-800/50 border-gray-700 focus:border-primary-main focus:ring-primary-main/50 rounded-xl"
                    placeholder="Password"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-main transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input pl-10 bg-gray-800/50 border-gray-700 focus:border-primary-main focus:ring-primary-main/50 rounded-xl"
                    placeholder="Confirm password"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400 group-focus-within:text-primary-main transition-colors" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input pl-10 bg-gray-800/50 border-gray-700 focus:border-primary-main focus:ring-primary-main/50 rounded-xl"
                    placeholder="Phone number"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="h-5 w-5 text-gray-400 group-focus-within:text-primary-main transition-colors" />
                  </div>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={handleChange}
                    className="form-input pl-10 bg-gray-800/50 border-gray-700 focus:border-primary-main focus:ring-primary-main/50 rounded-xl"
                    placeholder="Student ID"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGraduationCap className="h-5 w-5 text-gray-400 group-focus-within:text-primary-main transition-colors" />
                  </div>
                  <input
                    id="course"
                    name="course"
                    type="text"
                    required
                    value={formData.course}
                    onChange={handleChange}
                    className="form-input pl-10 bg-gray-800/50 border-gray-700 focus:border-primary-main focus:ring-primary-main/50 rounded-xl"
                    placeholder="Course"
                  />
                </div>
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      <FaUser className="w-5 h-5 mr-2" />
                      Create student account
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
              Join as a Student
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Register to track your attendance and stay connected with your courses.
              Get started with your student account today.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

const FeatureCard = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm">
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  </div>
);

const AuthForm = ({ type, role, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: type === 'signup' ? '' : undefined,
    employeeId: type === 'signup' && role === 'user' ? '' : undefined,
    department: type === 'signup' && role === 'user' ? '' : undefined,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const features = [
    {
      icon: <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      title: "Real-time Tracking",
      description: "Monitor attendance and time tracking in real-time with our advanced system"
    },
    {
      icon: <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      title: "Easy Check-in",
      description: "Simple and quick check-in process with facial recognition"
    },
    {
      icon: <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
      title: "Analytics Dashboard",
      description: "Comprehensive reports and insights at your fingertips"
    }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Left side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              {type === 'login' ? 'Welcome Back' : 'Join AttendEase'}
            </motion.h2>
            <p className="mt-2 text-gray-400">
              {type === 'login' 
                ? `Sign in to your ${role} account` 
                : `Create your ${role} account`}
            </p>
          </div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit} 
            className="mt-8 space-y-6"
          >
            {type === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            {type === 'signup' && role === 'user' && (
              <>
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-300">
                    Employee ID
                  </label>
                  <input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                    placeholder="EMP123"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-300">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                type === 'login' ? 'Sign In' : 'Create Account'
              )}
            </motion.button>

            <div className="text-center text-sm">
              <span className="text-gray-400">
                {type === 'login' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <Link 
                href={type === 'login' ? `/auth/signup/${role}` : `/auth/login/${role}`}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {type === 'login' ? 'Sign up' : 'Sign in'}
              </Link>
            </div>
          </motion.form>
        </div>
      </motion.div>

      {/* Right side - Features */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex w-1/2 bg-gray-900 p-12 items-center justify-center"
      >
        <div className="max-w-lg space-y-8">
          <div className="text-center mb-12">
            <Image
              src="/logo.png"
              alt="AttendEase Logo"
              width={150}
              height={150}
              className="mx-auto mb-6"
            />
            <h3 className="text-2xl font-bold text-white mb-4">
              Streamline Your Attendance Management
            </h3>
            <p className="text-gray-400">
              Join thousands of organizations that trust AttendEase for their attendance tracking needs
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-800">
            <p className="text-center text-gray-400 text-sm">
              "AttendEase has transformed how we manage attendance. It's efficient, reliable, and user-friendly!"
            </p>
            <p className="text-center text-white font-medium mt-2">
              - John Smith, HR Director
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;

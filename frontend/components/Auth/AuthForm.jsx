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
    phone: type === 'signup' ? '' : undefined,
    employeeId: type === 'signup' ? '' : undefined,
    department: type === 'signup' ? '' : undefined,
    studentId: type === 'signup' ? '' : undefined,
    course: type === 'signup' ? '' : undefined,
    semester: type === 'signup' ? '' : undefined,
    adminCode: type === 'signup' && role === 'admin' ? '' : undefined,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStudentFields, setShowStudentFields] = useState(false);

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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-white">
              {type === 'login' ? 'Welcome back!' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              {type === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Link href={type === 'login' ? `/auth/signup/${role}` : `/auth/login/${role}`} className="text-primary hover:text-primary/80">
                {type === 'login' ? 'Sign up' : 'Log in'}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-primary focus:ring-primary"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-primary focus:ring-primary"
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
                className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-primary focus:ring-primary"
              />
            </div>

            {type === 'signup' && (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-300">
                    Employee ID
                  </label>
                  <input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    required
                    value={formData.employeeId || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-300">
                    Department
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="showStudentFields"
                    name="showStudentFields"
                    type="checkbox"
                    checked={showStudentFields}
                    onChange={(e) => setShowStudentFields(e.target.checked)}
                    className="rounded bg-white/5 border-white/10 text-primary focus:ring-primary"
                  />
                  <label htmlFor="showStudentFields" className="text-sm text-gray-300">
                    I am also a student
                  </label>
                </div>

                {showStudentFields && (
                  <>
                    <div>
                      <label htmlFor="studentId" className="block text-sm font-medium text-gray-300">
                        Student ID
                      </label>
                      <input
                        id="studentId"
                        name="studentId"
                        type="text"
                        value={formData.studentId || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label htmlFor="course" className="block text-sm font-medium text-gray-300">
                        Course
                      </label>
                      <input
                        id="course"
                        name="course"
                        type="text"
                        value={formData.course || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label htmlFor="semester" className="block text-sm font-medium text-gray-300">
                        Semester
                      </label>
                      <select
                        id="semester"
                        name="semester"
                        value={formData.semester || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-primary focus:ring-primary"
                      >
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>Semester {num}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {role === 'admin' && (
                  <div>
                    <label htmlFor="adminCode" className="block text-sm font-medium text-gray-300">
                      Admin Registration Code
                    </label>
                    <input
                      id="adminCode"
                      name="adminCode"
                      type="text"
                      required
                      value={formData.adminCode || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-primary focus:ring-primary"
                    />
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : type === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right side - Features */}
      <div className="flex-1 bg-gradient-to-br from-primary/20 to-secondary/20 p-8 hidden md:flex md:flex-col md:justify-center">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white mb-8">Features</h2>
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
      </div>
    </div>
  );
};

export default AuthForm;

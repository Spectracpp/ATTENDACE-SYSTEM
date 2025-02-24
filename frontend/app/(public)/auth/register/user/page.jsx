'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  PhoneIcon,
  AcademicCapIcon,
  BuildingOffice2Icon as BuildingOfficeIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { LogoWithText } from '@/components/Logo';
import Link from 'next/link';
import SelectField from '@/components/common/SelectField';
import { courses, departments, semesters } from '@/data/formOptions';
import '@/styles/animations.css';

export default function UserRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user', // Default role for user registration
    studentId: '',
    course: '',
    semester: '',
    department: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation (letters and spaces only)
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = 'Name must be between 2 and 50 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Student ID validation
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    // Course validation
    if (!formData.course) {
      newErrors.course = 'Course is required';
    }

    // Semester validation
    if (!formData.semester) {
      newErrors.semester = 'Semester is required';
    }

    // Department validation
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // First check if email exists
      const checkEmailResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!checkEmailResponse.ok) {
        const data = await checkEmailResponse.json();
        if (checkEmailResponse.status === 409) {
          setErrors(prev => ({
            ...prev,
            email: 'This email is already registered'
          }));
          toast.error('This email is already registered');
          return;
        }
      }

      // Proceed with registration
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          const fieldError = data.field;
          const errorMessage = data.message || 'This field is already registered';
          setErrors(prev => ({ ...prev, [fieldError]: errorMessage }));
          toast.error(errorMessage);
          return;
        }
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/auth/login/user');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(prev => ({ ...prev, serverError: error.message || 'An error occurred during registration' }));
      toast.error(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClasses = "input-focus-animation block w-full pl-11 pr-4 py-3 bg-black/50 backdrop-blur-xl border border-[#ff0080]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff0080] focus:ring-1 focus:ring-[#ff0080] transition-colors";
  const errorClasses = "mt-1 text-sm text-red-500 animate-glitch";
  const iconClasses = "h-5 w-5 text-[#ff0080] animate-pulse";

  return (
    <div className="min-h-screen flex bg-black/90 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg opacity-5"></div>
      <div className="absolute inset-0 digital-rain"></div>
      <div className="scanline"></div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-[60%] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center relative z-10">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="hover-lift mb-6">
              <LogoWithText className="h-12 mx-auto" />
            </div>
            <h1 className="text-4xl font-bold mb-3 hover-glitch">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#4a1b9a] animate-neon">
                Student
              </span>{' '}
              <span className="text-white">Registration</span>
            </h1>
            <div className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link 
                href="/auth/login/user" 
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:from-[#7928ca] hover:to-[#4a1b9a] transition-all duration-300"
              >
                Sign In
              </Link>
              {' | '}
              <Link 
                href="/auth/register/admin" 
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#7928ca] to-[#4a1b9a] hover:from-[#ff0080] hover:to-[#7928ca] transition-all duration-300"
              >
                Admin Registration
              </Link>
            </div>
          </div>

          {errors.serverError && (
            <div className="mb-6 p-4 cyberpunk-card border-red-500/50 text-red-500 text-sm animate-glitch">
              {errors.serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4 cyberpunk-card p-6 hover-lift bg-gradient-to-br from-black via-black to-[#4a1b9a]/10">
                <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#ff0080] to-[#7928ca] animate-neon">
                  Personal Information
                </h2>
                
                {/* Name Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className={iconClasses} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full name"
                      className={`${inputBaseClasses} ${errors.name ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && <p className={errorClasses}>{errors.name}</p>}
                </div>

                {/* Email Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <EnvelopeIcon className={iconClasses} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      className={`${inputBaseClasses} ${errors.email ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className={errorClasses}>{errors.email}</p>}
                </div>

                {/* Phone Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <PhoneIcon className={iconClasses} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone number (10 digits)"
                      className={`${inputBaseClasses} ${errors.phone ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phone && <p className={errorClasses}>{errors.phone}</p>}
                </div>

                {/* Password Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyIcon className={iconClasses} />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className={`${inputBaseClasses} ${errors.password ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && <p className={errorClasses}>{errors.password}</p>}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyIcon className={iconClasses} />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className={`${inputBaseClasses} ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && <p className={errorClasses}>{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4 cyberpunk-card p-6 hover-lift bg-gradient-to-br from-black via-black to-[#4a1b9a]/10">
                <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#7928ca] to-[#4a1b9a] animate-neon">
                  Academic Information
                </h2>
                
                {/* Student ID Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IdentificationIcon className={iconClasses} />
                    </div>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Student ID"
                      className={`${inputBaseClasses} ${errors.studentId ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.studentId && <p className={errorClasses}>{errors.studentId}</p>}
                </div>

                {/* Course Select */}
                <SelectField
                  value={formData.course}
                  onChange={(value) => handleChange({ target: { name: 'course', value } })}
                  options={courses}
                  placeholder="Select Course"
                  icon={AcademicCapIcon}
                  error={errors.course}
                />

                {/* Semester Select */}
                <SelectField
                  value={formData.semester}
                  onChange={(value) => handleChange({ target: { name: 'semester', value } })}
                  options={semesters.map(sem => `Semester ${sem}`)}
                  placeholder="Select Semester"
                  icon={AcademicCapIcon}
                  error={errors.semester}
                />

                {/* Department Select */}
                <SelectField
                  value={formData.department}
                  onChange={(value) => handleChange({ target: { name: 'department', value } })}
                  options={departments}
                  placeholder="Select Department"
                  icon={BuildingOfficeIcon}
                  error={errors.department}
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="cyberpunk-button w-full button-animation bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#4a1b9a]"
              >
                {isLoading ? (
                  <span className="loading-animation">Creating Account...</span>
                ) : (
                  'Create Student Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-[40%] relative">
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 to-transparent z-10"></div>
        <div className="h-full flex items-center justify-center p-12 relative z-20">
          <div className="max-w-xl text-center">
            <h2 className="text-5xl font-bold mb-6 hover-glitch">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#4a1b9a] animate-neon">
                Join
              </span>{' '}
              <span className="text-white">The</span>{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7928ca] to-[#4a1b9a] animate-neon">
                Future
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Experience the next generation of attendance tracking with our gamified system.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: '🎮', label: 'Gamified Experience' },
                { icon: '💰', label: 'Earn Rewards' },
                { icon: '🏆', label: 'Track Progress' },
                { icon: '🔥', label: 'Build Streaks' },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="cyberpunk-card p-4 hover-lift group transition-transform bg-gradient-to-br from-black via-black to-[#4a1b9a]/10"
                >
                  <div className="text-3xl mb-2 group-hover:animate-pulse">{item.icon}</div>
                  <div className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

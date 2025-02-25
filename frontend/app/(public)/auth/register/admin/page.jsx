'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  BuildingOffice2Icon as BuildingOfficeIcon,
  PhoneIcon,
  IdentificationIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { LogoWithText } from '@/components/Logo';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizations } from '@/hooks/useOrganizations';

export default function AdminRegister() {
  const router = useRouter();
  const { register } = useAuth();
  const { organizations, loading: loadingOrgs } = useOrganizations();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    employeeId: '',
    department: '',
    role: 'admin',
    organizationId: '',
    organizationCode: '',
    registrationCode: ''
  });

  const [errors, setErrors] = useState({});

  const inputBaseClasses = "block w-full pl-11 pr-4 py-3 bg-black/50 backdrop-blur-xl border border-[#ff0080]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff0080] focus:ring-1 focus:ring-[#ff0080] transition-colors";
  const errorClasses = "mt-1 text-sm text-red-500";
  const iconClasses = "h-5 w-5 text-[#ff0080]";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // If organization is selected, auto-fill the organization code
      if (name === 'organizationId') {
        const selectedOrg = organizations.find(org => org._id === value);
        return {
          ...prev,
          [name]: value,
          organizationCode: selectedOrg ? selectedOrg.code : ''
        };
      }
      return { ...prev, [name]: value };
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation (2-50 characters, letters and spaces only)
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Employee ID validation
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    // Department validation
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    // Organization validation
    if (!formData.organizationId) {
      newErrors.organizationId = 'Organization is required';
    }

    // Organization Code validation
    if (!formData.organizationCode.trim()) {
      newErrors.organizationCode = 'Organization Code is required';
    }

    // Registration Code validation
    if (!formData.registrationCode.trim()) {
      newErrors.registrationCode = 'Admin registration code is required';
    }

    // Password validation (at least 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
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
        body: JSON.stringify({ 
          email: formData.email,
          organisation_uid: formData.organizationId 
        }),
      });

      if (!checkEmailResponse.ok) {
        const data = await checkEmailResponse.json();
        if (checkEmailResponse.status === 409) {
          setErrors(prev => ({
            ...prev,
            email: 'This email is already registered in this organization'
          }));
          toast.error('This email is already registered in this organization');
          return;
        }
      }

      // Proceed with registration
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData }),
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
      router.push('/auth/login/admin');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(prev => ({ ...prev, serverError: error.message || 'An error occurred during registration' }));
      toast.error(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black/90 relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute inset-0 animated-bg"></div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-[60%] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center relative z-10">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <LogoWithText className="h-12 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-3">
              <span className="cyberpunk-text-gradient">Admin</span>{' '}
              <span className="text-white">Registration</span>
            </h1>
            <div className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="text-[#ff0080] hover:text-[#ff0080]/80 transition-colors"
              >
                Sign In
              </Link>
              {' | '}
              <Link 
                href="/auth/register/user" 
                className="text-[#ff0080] hover:text-[#ff0080]/80 transition-colors"
              >
                Student Registration
              </Link>
            </div>
          </div>

          {errors.serverError && (
            <div className="mb-6 p-4 cyberpunk-card border-red-500/50 text-red-500 text-sm">
              {errors.serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4 cyberpunk-text-gradient">Personal Information</h2>
                
                {/* Name Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className={iconClasses} />
                    </div>
                    <input
                      type="text"
                      required
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
                      required
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
                      type="text"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
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
                      required
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
                      required
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

              {/* Organization Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4 cyberpunk-text-gradient">Organization Information</h2>

                {/* Organization Selection */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className={iconClasses} />
                    </div>
                    <select
                      required
                      name="organizationId"
                      value={formData.organizationId}
                      onChange={handleChange}
                      className={`${inputBaseClasses} ${errors.organizationId ? 'border-red-500' : ''}`}
                      disabled={loadingOrgs || isLoading}
                    >
                      <option value="">Select Organization</option>
                      {organizations.map((org) => (
                        <option key={org._id} value={org._id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.organizationId && <p className={errorClasses}>{errors.organizationId}</p>}
                </div>

                {/* Organization Code Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyIcon className={iconClasses} />
                    </div>
                    <input
                      type="text"
                      required
                      name="organizationCode"
                      value={formData.organizationCode}
                      onChange={handleChange}
                      placeholder="Organization code"
                      className={`${inputBaseClasses} ${errors.organizationCode ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                      readOnly
                    />
                  </div>
                  {errors.organizationCode && <p className={errorClasses}>{errors.organizationCode}</p>}
                </div>

                {/* Employee ID Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IdentificationIcon className={iconClasses} />
                    </div>
                    <input
                      type="text"
                      required
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      placeholder="Employee ID"
                      className={`${inputBaseClasses} ${errors.employeeId ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.employeeId && <p className={errorClasses}>{errors.employeeId}</p>}
                </div>

                {/* Department Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <AcademicCapIcon className={iconClasses} />
                    </div>
                    <input
                      type="text"
                      required
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Department"
                      className={`${inputBaseClasses} ${errors.department ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.department && <p className={errorClasses}>{errors.department}</p>}
                </div>

                {/* Registration Code Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyIcon className={iconClasses} />
                    </div>
                    <input
                      type="text"
                      required
                      name="registrationCode"
                      value={formData.registrationCode}
                      onChange={handleChange}
                      placeholder="Admin registration code"
                      className={`${inputBaseClasses} ${errors.registrationCode ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.registrationCode && <p className={errorClasses}>{errors.registrationCode}</p>}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="cyberpunk-button w-full"
              >
                {isLoading ? 'Creating Account...' : 'Create Admin Account'}
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
            <h2 className="text-5xl font-bold mb-6">
              <span className="cyberpunk-text-gradient">Manage</span>{' '}
              <span className="text-white">Your</span>{' '}
              <span className="cyberpunk-text-gradient">Institution</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Take control of your organization's attendance system with advanced administrative tools.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: '🎯', label: 'Track Attendance' },
                { icon: '📊', label: 'Generate Reports' },
                { icon: '🔐', label: 'Secure Access' },
                { icon: '⚡', label: 'Real-time Updates' },
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

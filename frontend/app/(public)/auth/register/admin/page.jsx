'use client';

import { useState } from 'react';
import { LogoWithText } from '@/components/Logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding } from 'react-icons/fa';
import OrganizationSelect from '@/app/components/OrganizationSelect';
import DepartmentSelect from '@/app/components/DepartmentSelect'; // Import DepartmentSelect component
import toast from 'react-hot-toast';

// Enhanced validation functions
const validateName = (name) => {
  if (!name) return 'Name is required';
  const trimmedName = name.trim();
  if (!trimmedName) return 'Name cannot be empty';
  if (!/^[a-zA-Z\s]{2,50}$/.test(trimmedName)) {
    return 'Name must be 2-50 characters long and contain only letters and spaces';
  }
  return '';
};

const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return 'Email cannot be empty';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return 'Please enter a valid email address';
  }
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[@$!%*?&]/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
  return '';
};

const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  const trimmedPhone = phone.replace(/\D/g, '');
  if (!trimmedPhone) return 'Phone number cannot be empty';
  if (!/^\d{10}$/.test(trimmedPhone)) {
    return 'Please enter a valid 10-digit phone number';
  }
  return '';
};

const validateOrganizationName = (name) => {
  if (!name) return 'Organization name is required';
  const trimmedName = name.trim();
  if (!trimmedName) return 'Organization name cannot be empty';
  if (!/^[a-zA-Z0-9\s\-&]{2,100}$/.test(trimmedName)) {
    return 'Organization name must be 2-100 characters long and can contain letters, numbers, spaces, hyphens, and &';
  }
  return '';
};

const validateRegistrationCode = (code) => {
  if (!code) return 'Registration code is required';
  const trimmedCode = code.trim();
  if (!trimmedCode) return 'Registration code cannot be empty';
  return '';
};

const validateDepartment = (department) => {
  if (!department) return 'Department is required';
  const trimmedDepartment = department.trim();
  if (!trimmedDepartment) return 'Department cannot be empty';
  return '';
};

export default function AdminRegister() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organizationName: '',
    registrationCode: '',
    department: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    const validations = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
      phone: validatePhone(formData.phone),
      organizationName: validateOrganizationName(formData.organizationName),
      registrationCode: validateRegistrationCode(formData.registrationCode),
      department: validateDepartment(formData.department)
    };

    // Add any validation errors to the errors object
    Object.entries(validations).forEach(([field, error]) => {
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setErrors({});  // Clear previous errors

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare registration data
      const registrationData = {
        ...formData,
        role: 'admin',
      };
      delete registrationData.confirmPassword;

      // First check if email exists
      const checkEmailResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      // Proceed with registration if email is available
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Handle specific duplicate field errors
          if (data.field === 'email') {
            setErrors(prev => ({
              ...prev,
              email: 'This email is already registered'
            }));
            toast.error('This email is already registered');
          } else if (data.field === 'phone') {
            setErrors(prev => ({
              ...prev,
              phone: 'This phone number is already registered'
            }));
            toast.error('This phone number is already registered');
          } else {
            setErrors(prev => ({
              ...prev,
              [data.field || 'email']: `This ${data.field || 'email'} is already registered`
            }));
            toast.error(`This ${data.field || 'email'} is already registered`);
          }
        } else if (data.missingFields) {
          // Handle missing fields
          const newErrors = {};
          data.missingFields.forEach(field => {
            newErrors[field] = `${field} is required`;
          });
          setErrors(prev => ({ ...prev, ...newErrors }));
          toast.error('Please fill in all required fields');
        } else if (data.validationErrors) {
          // Handle validation errors from backend
          setErrors(prev => ({ ...prev, ...data.validationErrors }));
          toast.error('Please check your input and try again');
        } else {
          // Handle other errors
          setServerError(data.message || 'Registration failed');
          toast.error(data.message || 'Registration failed');
        }
        return;
      }

      // Registration successful
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/auth/login/admin');

    } catch (error) {
      console.error('Registration error:', error);
      setServerError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "block w-full pl-11 pr-4 py-3 bg-[#161B22] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00f2ea] focus:border-transparent";
  const errorClasses = "mt-1 text-sm text-red-500";

  return (
    <div className="min-h-screen flex bg-[#0D1117]">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[45%] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center">
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-8">
            <LogoWithText className="h-12 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-3">Admin Registration</h1>
            <div className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login/admin" className="text-[#00f2ea] hover:text-[#00d8d8]">
                Sign In
              </Link>
              {' | '}
              <Link href="/auth/register/user" className="text-[#00f2ea] hover:text-[#00d8d8]">
                Student Registration
              </Link>
            </div>
          </div>

          {serverError && (
            <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className={`${inputClasses} ${errors.name ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.name && <p className={errorClasses}>{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className={`${inputClasses} ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className={errorClasses}>{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`${inputClasses} ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.password && <p className={errorClasses}>{errors.password}</p>}
            </div>

            {/* Confirm Password Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={`${inputClasses} ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && <p className={errorClasses}>{errors.confirmPassword}</p>}
            </div>

            {/* Phone Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className={`${inputClasses} ${errors.phone ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && <p className={errorClasses}>{errors.phone}</p>}
            </div>

            {/* Department Field */}
            <div className="space-y-1">
              <label htmlFor="department" className="block text-sm font-medium text-gray-300">
                Department
              </label>
              <DepartmentSelect
                value={formData.department}
                onChange={(value) => handleChange({ target: { name: 'department', value }})}
                error={errors.department}
              />
            </div>

            {/* Organization Name Field */}
            <div className="space-y-1">
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300">
                Organization Name
              </label>
              <OrganizationSelect
                value={formData.organizationName}
                onChange={handleChange}
                error={errors.organizationName}
              />
            </div>

            {/* Registration Code Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="registrationCode"
                  value={formData.registrationCode}
                  onChange={handleChange}
                  placeholder="Admin Registration Code"
                  className={`${inputClasses} ${errors.registrationCode ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.registrationCode && <p className={errorClasses}>{errors.registrationCode}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-[#00f2ea] hover:bg-[#00d8d8] text-black font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00f2ea] transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="hidden lg:block lg:w-[55%] bg-[#161B22]">
        <div className="h-full flex items-center justify-center p-12">
          <div className="max-w-xl text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Manage Your Organization
            </h2>
            <p className="text-gray-400 text-lg">
              Join our modern attendance management system. Track your organization's attendance effortlessly with QR-based check-ins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

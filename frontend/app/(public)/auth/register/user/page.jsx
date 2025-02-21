'use client';

import { useState } from 'react';
import { LogoWithText } from '@/components/Logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaIdCard, FaGraduationCap, FaBook, FaBuilding } from 'react-icons/fa';
import OrganizationSelect from '@/app/components/OrganizationSelect';
import DepartmentSelect from '@/app/components/DepartmentSelect';
import toast from 'react-hot-toast';

// Define options for dropdowns
const COURSE_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical'
];

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 1);

const DEPARTMENT_OPTIONS = [
  'IT',
  'CSE',
  'ECE',
  'ME',
  'CE',
  'EE'
];

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
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
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

const validateStudentId = (studentId) => {
  if (!studentId) return 'Student ID is required';
  const trimmedId = studentId.trim();
  if (!trimmedId) return 'Student ID cannot be empty';
  if (!/^[A-Z0-9-]{2,20}$/.test(trimmedId)) {
    return 'Student ID must be 2-20 characters and can contain uppercase letters, numbers, and hyphens';
  }
  return '';
};

const validateCourse = (course) => {
  if (!course) return 'Course is required';
  if (!COURSE_OPTIONS.includes(course)) return 'Please select a valid course';
  return '';
};

const validateSemester = (semester) => {
  if (!semester) return 'Semester is required';
  const semesterNum = parseInt(semester);
  if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
    return 'Please select a valid semester (1-8)';
  }
  return '';
};

const validateDepartment = (department) => {
  if (!department) return 'Please select a department';
  return '';
};

const validateOrganization = (org) => {
  if (!org) return 'Please select an organization';
  return '';
};

export default function UserRegister() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    studentId: '',
    course: '',
    semester: '',
    department: '',
    organizationName: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Student ID validation
    if (!formData.studentId) {
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
      newErrors.department = 'Please select a department';
    }

    // Organization validation
    if (!formData.organizationName) {
      newErrors.organizationName = 'Please select an organization';
    }

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
      console.log('Making request to backend...', {
        ...formData,
        password: '***hidden***'
      });

      // First check if email exists
      const checkEmailResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email,
          organizationName: formData.organizationName 
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
          setIsLoading(false);
          return;
        }
      }

      // Prepare registration data
      const registrationData = {
        ...formData,
        role: 'user'
      };

      // Proceed with registration
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        if (response.status === 409) {
          // Handle specific field errors
          const fieldError = data.field;
          const errorMessage = data.message || 'This field is already registered';
          
          setErrors(prev => ({
            ...prev,
            [fieldError]: errorMessage
          }));
          
          toast.error(errorMessage);
          setIsLoading(false);
          return;
        }
        
        // Handle other errors
        const errorMessage = data.message || 'Registration failed';
        setServerError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/auth/login/user');
    } catch (error) {
      console.error('Registration error:', error);
      setServerError('An error occurred during registration');
      toast.error('An error occurred during registration');
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
            <h1 className="text-3xl font-bold text-white mb-3">Student Registration</h1>
            <div className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login/user" className="text-[#00f2ea] hover:text-[#00d8d8]">
                Sign In
              </Link>
              {' | '}
              <Link href="/auth/register/admin" className="text-[#00f2ea] hover:text-[#00d8d8]">
                Admin Registration
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
              <div className="text-gray-400 text-sm">
                Password must be at least 6 characters long and contain:
                <ul className="list-disc pl-4">
                  <li>At least one lowercase letter</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character (@$!%*?&)</li>
                </ul>
              </div>
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

            {/* Student ID Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaIdCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="Student ID"
                  className={`${inputClasses} ${errors.studentId ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.studentId && <p className={errorClasses}>{errors.studentId}</p>}
            </div>

            {/* Course Select */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaGraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`${inputClasses} ${errors.course ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Select Course</option>
                  {COURSE_OPTIONS.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
              {errors.course && <p className={errorClasses}>{errors.course}</p>}
            </div>

            {/* Semester Select */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaGraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={`${inputClasses} ${errors.semester ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Select Semester</option>
                  {SEMESTER_OPTIONS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
              {errors.semester && <p className={errorClasses}>{errors.semester}</p>}
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
              Welcome to Student Portal
            </h2>
            <p className="text-gray-400 text-lg">
              Join our modern attendance management system. Track your attendance and academic progress with ease using QR-based check-ins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

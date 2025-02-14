'use client';

import { useRouter } from 'next/navigation';
import AuthForm from '@/components/Auth/AuthForm';
import { useEffect } from 'react';

export default function SignupPage({ params }) {
  const router = useRouter();
  const role = params.role;

  useEffect(() => {
    if (!role) {
      router.push('/auth/signup');
    }
  }, [role, router]);

  if (!role) {
    return null;
  }

  const handleSignup = async (formData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      // Redirect to login page after successful signup
      router.push(`/auth/login/${role}`);
    } catch (error) {
      throw error;
    }
  };

  return <AuthForm type="signup" role={role} onSubmit={handleSignup} />;
}

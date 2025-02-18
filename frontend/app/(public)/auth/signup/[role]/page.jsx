'use client';

import { useRouter, useParams } from 'next/navigation';
import AuthForm from '../../../../components/Auth/AuthForm';
import { useEffect, useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const params = useParams();
  const [paramsState, setParamsState] = useState(null);

  useEffect(() => {
    const fetchParams = async () => {
      const unwrappedParams = await params; // Unwrap params using await
      setParamsState(unwrappedParams);
    };
    
    fetchParams();
  }, [params]);

  const role = paramsState ? paramsState.role : null;

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

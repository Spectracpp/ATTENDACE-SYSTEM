'use client';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/Auth/AuthForm';

export default function LoginPage({ params }) {
  const router = useRouter();
  const { role } = params;

  const handleLogin = async (formData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      // Store the token in localStorage or a secure cookie
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', role);

      // Redirect to the appropriate dashboard
      router.push(role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (error) {
      throw error;
    }
  };

  return <AuthForm type="login" role={role} onSubmit={handleLogin} />;
}

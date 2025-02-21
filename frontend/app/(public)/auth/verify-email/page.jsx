'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      setError('');
      await verifyEmail(token);
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => router.push('/auth/login/user'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    try {
      setLoading(true);
      setError('');
      await resendVerificationEmail(email);
      setSuccess('Verification email sent successfully!');
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold gradient-text">Verify Your Email</h2>
          <p className="mt-2 text-gray-400">
            {email ? `We sent a verification email to ${email}` : 'Please verify your email address'}
          </p>
        </div>

        <div className="mt-8 cyber-border bg-accent-1/50 backdrop-blur-sm p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-500 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500 text-green-500 rounded-lg">
              {success}
            </div>
          )}

          <div className="text-center">
            {!token && (
              <>
                <p className="text-gray-300 mb-4">
                  Didn't receive the email? Check your spam folder or request a new one.
                </p>
                <button
                  onClick={handleResendEmail}
                  disabled={countdown > 0 || loading}
                  className={`w-full flex justify-center py-3 px-4 cyber-border border border-transparent text-sm font-medium text-white bg-primary/20 hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ${
                    (countdown > 0 || loading) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {countdown > 0
                    ? `Resend email (${countdown}s)`
                    : 'Resend verification email'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

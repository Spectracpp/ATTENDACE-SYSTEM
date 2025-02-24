'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Header from '@/components/Header/Header';

export default function PublicLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect logged-in users based on their role
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Only show the content if the user is not logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  );
}

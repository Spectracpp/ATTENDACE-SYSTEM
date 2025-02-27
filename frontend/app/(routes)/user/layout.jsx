'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import UserHeader from '@/components/UserHeader';
import UserSidebar from '@/components/UserSidebar';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'user')) {
      router.replace('/auth/login/user');
    }
  }, [user, loading, router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black/95">
        <div className="animate-pulse text-[#ff0080]">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'user') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-black/95">
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-20"
          >
            <UserSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : ''} transition-all duration-300`}>
        <UserHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        {/* Main Content */}
        <main className="pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

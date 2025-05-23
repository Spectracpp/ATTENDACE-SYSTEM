'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaBars, FaBell, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import Sidebar from '@/components/Sidebar/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <div className="animate-pulse text-[#ff0080]">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

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
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : ''} transition-all duration-300`}>
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
          <div className={`flex items-center justify-between h-16 px-4 ${isSidebarOpen ? 'ml-64' : ''} transition-all duration-300`}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <FaBars className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors relative">
                <FaBell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#ff0080] rounded-full"></span>
              </button>

              <button
                onClick={() => router.push('/admin/settings')}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <FaUser className="w-5 h-5" />
                <span>{user.name || 'Admin'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                title="Logout"
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

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

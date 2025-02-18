'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle } from 'react-icons/fa';
import { LogoWithText } from './Logo';
import { useAuth } from '../app/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
    setIsDropdownOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex-shrink-0 group">
                <div className="relative">
                  <LogoWithText height={32} />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                </div>
              </Link>
            </motion.div>

            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/"
                  className="relative text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors group"
                >
                  <span className="relative z-10">Home</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                </Link>
                
                {/* Auth Links */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 group"
                  >
                    <FaUserCircle className="w-5 h-5" />
                    <span>{user ? user.name : 'Account'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-1 z-50"
                      >
                        {user ? (
                          <>
                            <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
                              {user.role === 'admin' ? 'Admin Menu' : 'User Menu'}
                            </div>
                            <Link
                              href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 relative group"
                            >
                              <span className="relative z-10">Dashboard</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                            </Link>
                            <Link
                              href="/profile"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 relative group"
                            >
                              <span className="relative z-10">Profile</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 relative group"
                            >
                              <span className="relative z-10">Logout</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
                              User Access
                            </div>
                            <Link
                              href="/auth/login"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 relative group"
                            >
                              <span className="relative z-10">User Login</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                            </Link>
                            <Link
                              href="/auth/register"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 relative group"
                            >
                              <span className="relative z-10">User Register</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                            </Link>
                            
                            <div className="px-4 py-2 text-xs text-gray-400 border-b border-t border-gray-800">
                              Admin Access
                            </div>
                            <Link
                              href="/auth/admin/login"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 relative group"
                            >
                              <span className="relative z-10">Admin Login</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                            </Link>
                            <Link
                              href="/auth/register/admin"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 relative group"
                            >
                              <span className="relative z-10">Admin Register</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                            </Link>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Register Button - Only show when not logged in */}
                {!user && (
                  <Link
                    href="/auth/register"
                    className="bg-[#00f2ea] hover:bg-[#00d8d8] text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors relative group"
                  >
                    <span className="relative z-10">Register</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-gray-300 hover:text-white p-2 group"
                >
                  <FaUserCircle className="w-6 h-6" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {user ? (
                  <>
                    <Link
                      href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                      className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md relative group"
                    >
                      <span className="relative z-10">Dashboard</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md relative group"
                    >
                      <span className="relative z-10">Profile</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-md relative group"
                    >
                      <span className="relative z-10">Logout</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md relative group"
                    >
                      <span className="relative z-10">Login</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md relative group"
                    >
                      <span className="relative z-10">Register</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

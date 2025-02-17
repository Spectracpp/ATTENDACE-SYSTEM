'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle } from 'react-icons/fa';
import { LogoWithText } from './Logo';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <LogoWithText height={32} />
            </Link>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Home
              </Link>
              
              {/* Auth Links */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <FaUserCircle className="w-5 h-5" />
                  <span>Account</span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
                        User Access
                      </div>
                      <Link
                        href="/auth/login/user"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        User Login
                      </Link>
                      <Link
                        href="/auth/register"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        User Register
                      </Link>
                      
                      <div className="px-4 py-2 text-xs text-gray-400 border-b border-t border-gray-800">
                        Admin Access
                      </div>
                      <Link
                        href="/auth/login/admin"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Login
                      </Link>
                      <Link
                        href="/auth/admin/register"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Register
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Direct Register Button */}
              <Link
                href="/auth/register"
                className="bg-[#00f2ea] hover:bg-[#00d8d8] text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                <FaUserCircle className="w-6 h-6" />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-16 right-4 w-48 bg-gray-900 rounded-lg shadow-lg py-1 z-50"
                  >
                    <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
                      User Access
                    </div>
                    <Link
                      href="/auth/login/user"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      User Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      User Register
                    </Link>
                    
                    <div className="px-4 py-2 text-xs text-gray-400 border-b border-t border-gray-800">
                      Admin Access
                    </div>
                    <Link
                      href="/auth/login/admin"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin Login
                    </Link>
                    <Link
                      href="/auth/admin/register"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin Register
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

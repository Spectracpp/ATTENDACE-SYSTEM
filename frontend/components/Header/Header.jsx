'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  QrCodeIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { LogoWithText } from '@/components/Logo';

export default function Header() {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;

  const menuItems = user ? [
    {
      label: 'Profile',
      href: '/profile',
      icon: UserCircleIcon,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
    },
    ...(user?.role === 'admin' ? [
      {
        label: 'Generate QR',
        href: '/admin/qr-code',
        icon: QrCodeIcon,
      }
    ] : [
      {
        label: 'Scan QR',
        href: '/scan',
        icon: QrCodeIcon,
      }
    ]),
  ] : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] border-b border-[var(--bg-accent)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <LogoWithText className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  href="/auth/login/user"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register/user"
                  className="bg-[#00f2ea] text-black hover:bg-[#00d8d2] px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <UserCircleIcon className="h-8 w-8" />
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  >
                    <div className="py-1">
                      {menuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center px-4 py-2 text-sm ${
                            isActive(item.href)
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <item.icon className="h-5 w-5 mr-2" />
                          {item.label}
                        </Link>
                      ))}
                      {logout && (
                        <button
                          onClick={logout}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                          Logout
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

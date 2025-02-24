'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaQrcode, FaHistory, FaUser, FaTrophy, FaSignOutAlt } from 'react-icons/fa';

export default function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FaHome },
    { name: 'Scan QR', href: '/scan', icon: FaQrcode },
    { name: 'History', href: '/history', icon: FaHistory },
    { name: 'Profile', href: '/profile', icon: FaUser },
    { name: 'Rewards', href: '/rewards', icon: FaTrophy },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out 
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col bg-black/80 backdrop-blur-xl border-r border-[#ff0080]/20">
          {/* Logo */}
          <div className="p-6">
            <h1 className="text-2xl font-bold cyberpunk-text-gradient">
              AttendEase
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)} // Close sidebar on navigation
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-[#ff0080]/20 text-[#ff0080]'
                      : 'text-gray-400 hover:bg-[#ff0080]/10 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-[#ff0080]/20">
            <div className="px-4 py-3 rounded-lg bg-[#ff0080]/5">
              <p className="text-sm font-medium text-white">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400">
                {user?.email}
              </p>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="mt-4 w-full cyberpunk-button flex items-center justify-center gap-2"
            >
              <FaSignOutAlt />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

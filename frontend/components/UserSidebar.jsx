'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaUserClock, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const navItems = [
  {
    label: 'Dashboard',
    href: '/user/dashboard',
    icon: FaHome
  },
  {
    label: 'Attendance',
    href: '/user/attendance',
    icon: FaUserClock
  },
  {
    label: 'Leaves',
    href: '/user/leaves',
    icon: FaCalendarAlt
  },
  {
    label: 'Profile',
    href: '/user/profile',
    icon: FaUserCircle
  }
];

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-black/40 backdrop-blur-xl border-r border-gray-800 h-screen w-64 transition-all duration-300 ease-in-out flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff0080] to-[#7928ca] bg-clip-text text-transparent">
          AttendEase
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          User Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-black/40'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <span className="ml-3">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

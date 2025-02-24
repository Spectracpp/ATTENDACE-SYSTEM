'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaUser, FaQrcode, FaHistory, FaTrophy, FaBuilding, FaUsers, FaCalendarAlt, FaChartBar, FaCog } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // User-specific navigation items
  const userNavigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: FaHome 
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: FaUser 
    },
    { name: 'Scan QR', href: '/scan', icon: FaQrcode },
    { name: 'History', href: '/history', icon: FaHistory },
    { name: 'Rewards', href: '/rewards', icon: FaTrophy },
  ];

  // Admin-specific navigation items
  const adminNavigation = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: FaHome 
    },
    { 
      name: 'Organizations', 
      href: '/admin/organizations', 
      icon: FaBuilding,
      description: 'Manage organizations and their members'
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: FaUsers,
      description: 'Manage user accounts and permissions'
    },
    { 
      name: 'Attendance', 
      href: '/admin/attendance', 
      icon: FaCalendarAlt,
      description: 'View and manage attendance records'
    },
    { 
      name: 'QR Codes', 
      href: '/admin/qr-codes', 
      icon: FaQrcode,
      description: 'Generate and manage QR codes'
    },
    { 
      name: 'Analytics', 
      href: '/admin/analytics', 
      icon: FaChartBar,
      description: 'View attendance and user statistics'
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: FaCog,
      description: 'Configure system settings'
    }
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  return (
    <div 
      className={`bg-black/40 backdrop-blur-xl border-r border-gray-800 h-screen ${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 ease-in-out flex flex-col`}
    >
      {/* Logo */}
      <div className="p-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff0080] to-[#7928ca] bg-clip-text text-transparent">
          {isCollapsed ? 'AE' : 'AttendEase'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {isCollapsed ? '' : isAdmin ? 'Admin Panel' : 'User Panel'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-black/40'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              {!isCollapsed && (
                <span className="ml-3">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 text-gray-400 hover:text-white transition-colors duration-200"
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </div>
  );
}

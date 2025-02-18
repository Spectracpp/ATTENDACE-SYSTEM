'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../app/context/AuthContext';
import {
  FaHome,
  FaQrcode,
  FaHistory,
  FaTrophy,
  FaCog,
  FaUsers,
  FaChartBar,
  FaBuilding,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const userMenuItems = [
  {
    title: 'Dashboard',
    icon: FaHome,
    path: '/dashboard',
  },
  {
    title: 'Scan QR',
    icon: FaQrcode,
    path: '/scan',
  },
  {
    title: 'Attendance History',
    icon: FaHistory,
    path: '/history',
  },
  {
    title: 'Rewards',
    icon: FaTrophy,
    path: '/rewards',
  },
  {
    title: 'Settings',
    icon: FaCog,
    path: '/settings',
  },
];

const adminMenuItems = [
  {
    title: 'Dashboard',
    icon: FaHome,
    path: '/admin/dashboard',
  },
  {
    title: 'Users',
    icon: FaUsers,
    path: '/admin/users',
  },
  {
    title: 'Analytics',
    icon: FaChartBar,
    path: '/admin/analytics',
  },
  {
    title: 'Organization',
    icon: FaBuilding,
    path: '/admin/organization',
  },
  {
    title: 'Notifications',
    icon: FaBell,
    path: '/admin/notifications',
  },
  {
    title: 'Settings',
    icon: FaCog,
    path: '/admin/settings',
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gray-800">
            <span className={`text-xl font-bold ${!isOpen && 'lg:hidden'}`}>
              AttendEase
            </span>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-6 py-3 text-sm ${
                    isActive
                      ? 'bg-[#00f2ea] text-black font-medium'
                      : 'text-gray-300 hover:bg-gray-800'
                  } transition-colors`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                  <span className={`ml-3 ${!isOpen && 'lg:hidden'}`}>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-800 p-4">
            <div className={`flex items-center mb-4 ${!isOpen && 'lg:hidden'}`}>
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="h-5 w-5" />
              <span className={`ml-3 ${!isOpen && 'lg:hidden'}`}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Your page content goes here */}
      </div>
    </>
  );
}

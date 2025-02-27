'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { FaUserCircle, FaBell, FaSignOutAlt, FaBars, FaBuilding, FaExchangeAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function UserHeader({ toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      message: 'Your leave request has been approved',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      message: 'Please mark your attendance for today',
      time: '5 hours ago',
      read: true
    }
  ];

  return (
    <header className={`fixed top-0 right-0 left-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800 ${isSidebarOpen ? 'ml-64' : ''} transition-all duration-300`}>
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <FaBars className="w-5 h-5" />
          </button>

          {user?.activeOrganization && (
            <div className="relative">
              <button
                onClick={() => setShowOrgMenu(!showOrgMenu)}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <FaBuilding className="w-4 h-4 text-[#ff0080]" />
                <span className="hidden md:inline-block max-w-[150px] truncate">
                  {user.activeOrganization.name}
                </span>
                <FaExchangeAlt className="w-3 h-3" />
              </button>

              {showOrgMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <h3 className="font-semibold text-white">Organization</h3>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{user.activeOrganization.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{user.activeOrganization.type}</p>
                  </div>
                  <Link
                    href="/user/organizations"
                    className="flex items-center gap-3 px-4 py-2 text-[#ff0080] hover:text-white hover:bg-gray-700/50 transition-colors"
                  >
                    <FaExchangeAlt className="w-3 h-3" />
                    Switch Organization
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors relative"
            >
              <FaBell className="w-5 h-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#ff0080] rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2">
                <div className="px-4 py-2 border-b border-gray-700">
                  <h3 className="font-semibold text-white">Notifications</h3>
                </div>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-700/50 ${
                      !notification.read ? 'bg-gray-700/20' : ''
                    }`}
                  >
                    <p className="text-sm text-white">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    No new notifications
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <FaUserCircle className="w-5 h-5" />
              <span>{user?.name}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2">
                <Link
                  href="/user/profile"
                  className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                >
                  <FaUserCircle />
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

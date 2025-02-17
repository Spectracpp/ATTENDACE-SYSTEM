'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCog, FaUser, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function RoleSwitcher({ currentRole, currentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const getOppositeRole = () => currentRole === 'admin' ? 'user' : 'admin';
  const oppositeRole = getOppositeRole();

  const menuItems = [
    {
      label: `${oppositeRole === 'admin' ? 'Admin' : 'User'} Login`,
      icon: <FaSignInAlt />,
      path: `/auth/login/${oppositeRole}`
    },
    {
      label: `${oppositeRole === 'admin' ? 'Admin' : 'User'} Register`,
      icon: <FaUserPlus />,
      path: oppositeRole === 'admin' ? '/auth/admin/register' : '/auth/register'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute bottom-16 right-0 mb-2 bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800 min-w-[200px]"
          >
            {menuItems.map((item, index) => (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors"
              >
                <span className="text-[#00f2ea]">{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        className="bg-[#00f2ea] hover:bg-[#00d8d8] text-black p-4 rounded-full shadow-lg flex items-center justify-center transition-colors relative"
      >
        {currentRole === 'admin' ? (
          <FaUser className="w-6 h-6" />
        ) : (
          <FaUserCog className="w-6 h-6" />
        )}
        {isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
          />
        )}
      </motion.button>
    </div>
  );
}

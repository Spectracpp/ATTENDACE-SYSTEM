'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push('/');
  };

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/95 backdrop-blur-md shadow-lg' : 'bg-background/50 backdrop-blur-sm'
    }`}>
      <nav className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left Corner */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 animate-float">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-blue-500">
                AttendEase
              </span>
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {['Dashboard', 'Attendance', 'Rewards', 'Reports'].map((item) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`} 
                className="text-gray-300 hover:text-primary transition-colors hover-underline"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Right Corner - Auth Buttons or Profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <button className="p-2 text-gray-300 hover:text-primary transition-colors relative group">
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse-slow">
                    3
                  </div>
                  <svg className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>

                {/* Token Balance */}
                <div className="hidden md:flex items-center cyber-border px-3 py-1 animate-border">
                  <span className="text-primary font-semibold">{user.tokens || 0} </span>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 cyber-border p-1 hover:border-primary transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                      {user.profilePic ? (
                        <Image
                          src={user.profilePic}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-300 group-hover:text-primary">
                      {user.name}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background border border-primary/20 rounded-lg shadow-lg py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-accent-1 hover:text-primary"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-accent-1 hover:text-primary"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Settings
                      </Link>
                      <div className="border-t border-primary/20 my-1"></div>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-accent-1 hover:text-primary"
                        onClick={handleLogout}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login/user"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup/user"
                  className="cyber-border px-4 py-2 text-primary hover:bg-primary/10 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-primary transition-colors"
            >
              <svg className="h-6 w-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  className="transition-all duration-300"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-primary/20 py-4 animate-slideDown">
            <div className="space-y-3">
              {['Dashboard', 'Attendance', 'Rewards', 'Reports'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="block text-gray-300 hover:text-primary transition-colors hover:bg-accent-1 px-4 py-2"
                >
                  {item}
                </Link>
              ))}
              {user && (
                <div className="border-t border-primary/20 pt-3 px-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span>Balance:</span>
                    <span className="text-primary font-semibold">{user.tokens || 0} </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

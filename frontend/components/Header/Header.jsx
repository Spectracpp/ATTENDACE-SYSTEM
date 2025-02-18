"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogoWithText } from "../Logo";

const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login/user");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LogoWithText height={32} animated={false} />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-400 hover:text-[#00f2ea] transition-colors"
          >
            Home
          </Link>

          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-gray-400 hover:text-[#00f2ea] transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-[#00f2ea] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/rewards"
                className="text-gray-400 hover:text-[#00f2ea] transition-colors"
              >
                Rewards
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 rounded-lg bg-[#00f2ea] text-black hover:bg-[#00d8d8] transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-[#00f2ea] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-md border-b border-gray-800 md:hidden">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-[#00f2ea] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>

              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="text-gray-400 hover:text-[#00f2ea] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="text-gray-400 hover:text-[#00f2ea] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/rewards"
                    className="text-gray-400 hover:text-[#00f2ea] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Rewards
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login/user"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 rounded-lg bg-[#00f2ea] text-black hover:bg-[#00d8d8] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

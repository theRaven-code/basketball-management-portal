"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={`text-xl font-bold tracking-wide ${
                isActive("/") ? "text-white" : "hover:text-blue-100"
              } transition-all duration-200`}
            >
              Basketball Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
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
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link
                  href="/players"
                  className={`${
                    isActive("/players")
                      ? "text-white font-medium"
                      : "text-gray-100 hover:text-blue-100"
                  } transition-all duration-200`}
                >
                  Players
                </Link>
                <Link
                  href="/teams"
                  className={`${
                    isActive("/teams")
                      ? "text-white font-medium"
                      : "text-gray-100 hover:text-blue-100"
                  } transition-all duration-200`}
                >
                  Teams
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm bg-blue-500/20 px-3 py-1 rounded-full">
                    {user.username.length > 12
                      ? user.username.slice(0, 12) + "..."
                      : user.username}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-all duration-200 ${
                  isActive("/login") ? "ring-2 ring-blue-300" : ""
                }`}
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {user && (
              <>
                <Link
                  href="/players"
                  className={`block ${
                    isActive("/players")
                      ? "text-white font-medium"
                      : "hover:text-blue-100"
                  } transition-all duration-200`}
                >
                  Players
                </Link>
                <Link
                  href="/teams"
                  className={`block ${
                    isActive("/teams")
                      ? "text-white font-medium"
                      : "hover:text-blue-100"
                  } transition-all duration-200`}
                >
                  Teams
                </Link>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm bg-blue-500/20 px-3 py-1 rounded-full">
                    {user.username.length > 12
                      ? user.username.slice(0, 12) + "..."
                      : user.username}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`block bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-all duration-200 ${
                  isActive("/login") ? "ring-2 ring-blue-300" : ""
                }`}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

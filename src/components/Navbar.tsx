"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className={`text-xl font-bold tracking-wide ${
              isActive("/") ? "text-white" : "hover:text-blue-100"
            } transition-all duration-200`}
          >
            Basketball Portal
          </Link>
          {user && (
            <div className="flex items-center space-x-6">
              <Link
                href="/players"
                className={`${
                  isActive("/players")
                    ? "text-white font-medium"
                    : "hover:text-blue-100"
                } transition-all duration-200`}
              >
                Players
              </Link>
              <Link
                href="/teams"
                className={`${
                  isActive("/teams")
                    ? "text-white font-medium"
                    : "hover:text-blue-100"
                } transition-all duration-200`}
              >
                Teams
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm bg-blue-500/20 px-3 py-1 rounded-full">
                {user.username.length > 12
                  ? user.username.slice(0, 12) + "..."
                  : user.username}
              </span>
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-all duration-200"
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
    </nav>
  );
}

"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold">
            Basketball Portal
          </Link>
          <Link
            href="/players"
            className="hover:text-blue-200 transition-colors"
          >
            Players
          </Link>
          <Link href="/teams" className="hover:text-blue-200 transition-colors">
            Teams
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm">Welcome, {user.username}</span>
              <button
                onClick={logout}
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

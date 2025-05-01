"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-blue-600 text-blue-200 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className={`text-xl font-bold ${
              isActive("/") ? "text-blue-200" : "hover:text-blue-200"
            } transition-colors`}
          >
            Basketball ManagementPortal
          </Link>
          {user && (
            <>
              <Link
                href="/players"
                className={`${
                  isActive("/players") ? "text-white" : "hover:text-white"
                } transition-colors`}
              >
                Players
              </Link>
              <Link
                href="/teams"
                className={`${
                  isActive("/teams") ? "text-white" : "hover:text-white"
                } transition-colors`}
              >
                Teams
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm">
                Welcome,{" "}
                {user.username.length > 12
                  ? user.username.slice(0, 12) + "..."
                  : user.username}
              </span>
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
              className={`bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition-colors ${
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

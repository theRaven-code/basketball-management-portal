"use client";

import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-4 p-3 sm:p-6 md:p-8 bg-white rounded-lg shadow">
          <h2 className="text-xl sm:text-2xl md:text-3xl text-center font-extrabold text-gray-900">
            Please log in to continue
          </h2>
          <a
            href="/login"
            className="block w-full text-center bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-4 p-3 sm:p-6 md:p-8 bg-white rounded-lg shadow">
        <h2 className="text-xl sm:text-2xl md:text-3xl text-center font-extrabold text-gray-900">
          Welcome, {user.username}!
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-center text-gray-700">
          Use the navigation bar to manage players and teams.
        </p>
      </div>
    </div>
  );
}

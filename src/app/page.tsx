"use client";

import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    // Show login form or redirect to /login
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Please log in to continue
          </h2>
          <a
            href="/login"
            className="block mt-6 w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Show welcome message if logged in
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome, {user.username}!
        </h2>
        <p className="text-center text-lg text-gray-700 mt-4">
          Use the navigation bar to manage players and teams.
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Basketball Management Portal",
  description: "Manage your basketball teams and players",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}
      >
        <AuthProvider>
          <AppProvider>
            <header className="sticky top-0 z-50">
              <Navbar />
            </header>
            <main className="flex-1 w-full px-2 sm:container sm:mx-auto sm:px-4 py-2 sm:py-4 md:py-6 max-w-7xl">
              <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 md:p-6">
                {children}
              </div>
            </main>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

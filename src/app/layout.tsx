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
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            <Navbar />
            <main className="container mx-auto p-4">{children}</main>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

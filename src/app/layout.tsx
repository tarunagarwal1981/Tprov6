import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ImprovedAuthProvider } from "@/context/ImprovedAuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel Booking Platform",
  description: "A comprehensive travel booking platform with authentication and role-based access control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <LoadingProvider>
            <ImprovedAuthProvider>
              {children}
            </ImprovedAuthProvider>
          </LoadingProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
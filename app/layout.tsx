import { Agentation } from "agentation";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav, Sidebar } from "./components/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OQ1",
  description: "OQ1 - Share your quiet time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-fafafa text-gray-900 pb-16 md:pb-0 md:pl-64">
          <Sidebar />
          <main className="max-w-2xl mx-auto min-h-screen md:py-8">
            {children}
          </main>
          <BottomNav />
        </div>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}

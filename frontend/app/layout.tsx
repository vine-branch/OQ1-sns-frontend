import { Agentation } from "agentation";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import LayoutShell from "./components/LayoutShell";
import { SerwistProvider } from "./serwist";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OQ1: 오늘 큐티 완료",
    template: "%s | OQ1",
  },
  description: "매일 QT를 나누고 사람을 연결하는 플랫폼",
  applicationName: "OQ1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OQ1",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "OQ1",
    locale: "ko_KR",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
        <SerwistProvider swUrl="/serwist/sw.js">
          <LayoutShell>{children}</LayoutShell>
        </SerwistProvider>
        <Toaster position="top-center" richColors duration={1500} />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}

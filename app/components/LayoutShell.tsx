'use client';

import { usePathname } from 'next/navigation';
import { AlertProvider } from './AlertProvider';
import { ConfirmProvider } from './ConfirmProvider';
import { BottomNav, Sidebar } from './Navigation';
import { QueryProvider } from './QueryProvider';

const MINIMAL_LAYOUT_PATHS = ['/login', '/signup', '/privacy', '/terms'];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMinimal = MINIMAL_LAYOUT_PATHS.some((p) => pathname?.startsWith(p));

  if (isMinimal) {
    return (
      <QueryProvider>
        <AlertProvider>
          <ConfirmProvider>
            <div className="min-h-screen bg-fafafa text-gray-900">
              {children}
            </div>
          </ConfirmProvider>
        </AlertProvider>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <AlertProvider>
        <ConfirmProvider>
          <div className="min-h-screen bg-fafafa text-gray-900 pb-16 md:pb-0 md:pl-64">
            <Sidebar />
            <main className="max-w-2xl mx-auto min-h-screen md:py-8">
              {children}
            </main>
            <BottomNav />
          </div>
        </ConfirmProvider>
      </AlertProvider>
    </QueryProvider>
  );
}

"use client";

import { Heart, PlusSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileHeaderProps {
  rightContent?: React.ReactNode;
}

export function MobileHeader({ rightContent }: MobileHeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex justify-between items-center">
      <Link href="/" onClick={handleLogoClick}>
        <h1 className="text-xl font-bold italic font-serif tracking-tight">
          OQ1
        </h1>
      </Link>
      <div className="flex items-center gap-4">
        {rightContent || (
          <>
            <div className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600">
              D-12
            </div>
            <Link href="/upload">
              <PlusSquare size={24} className="text-black" strokeWidth={1.5} />
            </Link>
            <Heart size={24} className="text-black" strokeWidth={1.5} />
          </>
        )}
      </div>
    </div>
  );
}

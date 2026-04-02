"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfirm } from "../components/ConfirmProvider";
import { MobileHeader } from "../components/MobileHeader";
import ProfileView from "../components/ProfileView";

function ProfileMenu() {
  const router = useRouter();
  const confirm = useConfirm();

  const handleLogout = async () => {
    if (!(await confirm("로그아웃 하시겠어요?"))) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-2 -m-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
          aria-label="메뉴 열기"
        >
          <Menu size={24} strokeWidth={1.5} className="text-gray-700" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 p-0 rounded-xl"
      >
        <div className="py-1">
          <Link
            href="/mypage/edit"
            className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            프로필 편집
          </Link>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut size={16} strokeWidth={2} />
            로그아웃
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function MyPageContent({
  userId,
  initialProfile,
}: {
  userId: string;
  initialProfile?: Parameters<typeof ProfileView>[0]["initialProfile"];
}) {
  return (
    <div className="pb-20 md:py-8">
      <MobileHeader rightContent={<ProfileMenu />} />

      <div className="mt-2 md:mt-0 relative">
        <ProfileView
          userId={userId}
          isOwnProfile
          initialProfile={initialProfile}
        >
          <ProfileMenu />
        </ProfileView>
      </div>
    </div>
  );
}

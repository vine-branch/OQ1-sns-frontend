"use client";

import { MobileHeader } from "@/app/components/MobileHeader";
import ProfileView from "@/app/components/ProfileView";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const targetUserId = params.id as string;

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        // 만약 자신의 프로필로 왔다면 마이페이지로 리다이렉트 (선택 사항)
        if (user.id === targetUserId) {
          router.replace("/mypage");
        }
      }
    };
    checkUser();
  }, [targetUserId, router]);

  return (
    <div className="pb-20 md:py-8">
      <MobileHeader
        leftContent={
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft
              size={24}
              strokeWidth={1.5}
              className="text-gray-700"
            />
          </button>
        }
      />

      <div className="mt-2 md:mt-0">
        <ProfileView
          userId={targetUserId}
          isOwnProfile={currentUserId === targetUserId}
        />
      </div>
    </div>
  );
}

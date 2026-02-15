"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export type KakaoProfile = {
  userName: string | null;
  avatarUrl: string | null;
  isLoaded: boolean;
};

export function useKakaoProfile(fromKakao: boolean): KakaoProfile {
  const [state, setState] = useState<KakaoProfile>({
    userName: null,
    avatarUrl: null,
    isLoaded: !fromKakao,
  });

  useEffect(() => {
    if (!fromKakao) return;
    let cancelled = false;
    const run = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      // TODO: 나중에 제거 예정. 카카오/Supabase user_metadata 확인용 (개발 환경에서만 출력)
      if (process.env.NODE_ENV === "development" && user) {
        console.log("[Kakao Signup] auth user:", user);
        console.log("[Kakao Signup] user_metadata:", user.user_metadata);
        console.log(
          "[Kakao Signup] raw_user_meta_data:",
          (user as { raw_user_meta_data?: unknown }).raw_user_meta_data,
        );
      }
      if (!user?.user_metadata) {
        setState((s) => ({ ...s, isLoaded: true }));
        return;
      }
      const meta = user.user_metadata as Record<string, unknown>;
      const nickname = [
        meta.full_name,
        meta.name,
        meta.user_name,
        meta.nickname,
      ].find((v): v is string => typeof v === "string");
      const avatarUrl = [
        meta.avatar_url,
        meta.picture,
        meta.profile_image,
        meta.image,
      ].find((v): v is string => typeof v === "string");

      if (!cancelled) {
        setState({
          userName: nickname ? nickname.trim().slice(0, 10) : null,
          avatarUrl: avatarUrl ?? null,
          isLoaded: true,
        });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [fromKakao]);

  return state;
}

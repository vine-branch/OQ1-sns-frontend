"use client";

import { createClient } from "@/lib/supabase/client";
import { useAlert } from "@/app/components/AlertProvider";
import { useCallback, useEffect, useRef } from "react";

type OAuthProvider = "kakao" | "apple";

export function useOAuthLogin(onBeforeLogin?: () => void) {
  const showAlert = useAlert();
  const onBeforeLoginRef = useRef(onBeforeLogin);
  useEffect(() => {
    onBeforeLoginRef.current = onBeforeLogin;
  });

  const login = useCallback(
    async (provider: OAuthProvider) => {
      try {
        onBeforeLoginRef.current?.();
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          },
        });
        if (error) {
          console.error(`${provider} signIn error:`, error);
          showAlert("로그인에 실패했습니다.");
          return;
        }
        if (data?.url) {
          window.location.href = data.url;
        }
      } catch (e) {
        console.error(`${provider} login error:`, e);
        showAlert("Supabase 설정을 확인해 주세요. (.env.local)");
      }
    },
    [showAlert],
  );

  return { login };
}

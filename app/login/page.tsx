"use client";

import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { isFeatureEnabled } from "@/lib/utils";
import { useAlert } from "../components/AlertProvider";

const fadeRise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" as const, delay },
});

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showAlert = useAlert();
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const isTestMode = searchParams.get("test") === "true";
  const isAppleLoginEnabled = isFeatureEnabled("appleLogin");

  useEffect(() => {
    // 이미 로그인한 사용자는 홈으로 리다이렉트
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.replace("/");
        return;
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    // Supabase OAuth 실패 시 redirectTo URL에 hash로 전달됨: #error=...&error_description=...
    const hash =
      typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    const params = new URLSearchParams(hash || searchParams.toString());
    const error = params.get("error");
    const description = params.get("error_description") || "";

    if (error) {
      let message: string;

      if (error === "account_expired") {
        message = "영구 삭제된 계정입니다. 다시 가입해 주세요.";
      } else if (description.includes("email")) {
        message =
          "카카오에서 이메일 제공에 동의해 주시거나, 앱 관리자가 카카오 동의항목(이메일) 설정을 완료했는지 확인해 주세요.";
      } else {
        message = description
          ? decodeURIComponent(description.replace(/\+/g, " "))
          : "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
      }

      queueMicrotask(() => setOauthError(message));
      // URL에서 에러 파라미터 제거 (새로고침 시 메시지 안 나오게)
      if (typeof window !== "undefined" && window.history.replaceState) {
        const clean = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", clean);
      }
    }
  }, [searchParams]);

  const handleOAuthLogin = async (provider: "kakao" | "apple") => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
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
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showAlert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setEmailLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Email signIn error:", error);
        showAlert("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      router.replace("/");
    } catch (e) {
      console.error("Email login error:", e);
      showAlert("로그인 중 문제가 발생했습니다.");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fafafa flex flex-col items-center justify-center px-4 py-12">
      <motion.div {...fadeRise(0)} className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-8 mb-4">
        <h1 className="text-2xl font-bold italic font-serif tracking-tight text-center text-gray-900">
          OQ1
        </h1>
        <p className="text-center text-sm font-medium text-gray-600 mt-1">
          오늘 큐티 완료
        </p>
        <p className="text-center text-xs text-gray-500 mt-2 mb-8">
          매일 QT를 나누고 사람을 연결하는 플랫폼
        </p>

        {oauthError && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
            {oauthError}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin("kakao")}
            className="w-full py-3 flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#FADA0A] active:bg-[#E6D000] text-[#191919] text-sm font-semibold rounded-md transition-colors"
          >
            <svg
              className="w-5 h-5 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.966C1.5 6.665 6.201 3 12 3Z" />
            </svg>
            카카오로 로그인
          </button>

          {isAppleLoginEnabled && (
            <button
              type="button"
              onClick={() => handleOAuthLogin("apple")}
              className="w-full py-3 flex items-center justify-center gap-2 bg-black hover:bg-gray-800 active:bg-gray-900 text-white text-sm font-semibold rounded-md transition-colors"
            >
              <svg
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple로 로그인
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          {isAppleLoginEnabled
            ? "카카오 또는 Apple 계정으로 로그인·가입됩니다."
            : "카카오 계정으로 로그인·가입됩니다."}{" "}
          처음 이용 시 다음 단계에서 회원 정보를 입력해 주세요.
        </p>

        {isTestMode && (
          <form onSubmit={handleEmailLogin} className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center mb-4">
              테스트 계정 로그인
            </p>
            <div className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 active:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? "로그인 중..." : "로그인"}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      <motion.div {...fadeRise(0.1)} className="mt-6 flex flex-col items-center gap-2">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
          ← 홈으로
        </Link>
        <div className="flex gap-3 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-gray-600">
            이용약관
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-600">
            개인정보 처리방침
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

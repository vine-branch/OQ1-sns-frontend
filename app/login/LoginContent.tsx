"use client";

import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { isFeatureEnabled } from "@/lib/utils";
import { useAlert } from "../components/AlertProvider";
import { useOAuthLogin } from "../hooks/useOAuthLogin";
import OAuthLoginButton from "../components/OAuthLoginButton";

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

  const { login: oauthLogin } = useOAuthLogin();

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
          <OAuthLoginButton provider="kakao" onClick={() => oauthLogin("kakao")} />
          {isAppleLoginEnabled && (
            <OAuthLoginButton provider="apple" onClick={() => oauthLogin("apple")} />
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

export default function LoginPageContent() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

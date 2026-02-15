"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const [oauthError, setOauthError] = useState<string | null>(null);

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

  const handleKakaoLogin = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });
      if (error) {
        console.error("Kakao signIn error:", error);
        alert("로그인에 실패했습니다.");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Kakao login error:", e);
      alert("Supabase 설정을 확인해 주세요. (.env.local)");
    }
  };

  return (
    <div className="min-h-screen bg-fafafa flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-8 mb-4">
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
        <button
          type="button"
          onClick={handleKakaoLogin}
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
        <p className="text-center text-xs text-gray-500 mt-4">
          카카오 계정 하나로 로그인·가입됩니다. 처음 이용 시 다음 단계에서 회원
          정보를 입력해 주세요.
        </p>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">
          ← 홈으로
        </Link>
      </p>
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

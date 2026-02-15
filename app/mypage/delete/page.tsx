"use client";

import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<"warning" | "confirm">("warning");
  const [confirmText, setConfirmText] = useState("");

  const handleDeactivate = async () => {
    if (confirmText !== "회원탈퇴") {
      alert('정확히 "회원탈퇴"를 입력해주세요.');
      return;
    }

    setIsDeleting(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      // API 호출로 계정 영구 삭제 (카카오 연결 끊기 포함)
      const response = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider_token: session.provider_token,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Account deletion error:", errorData);
        alert(
          `회원탈퇴 처리 중 오류가 발생했습니다.\n에러: ${errorData.error}\n다시 시도해 주세요.`,
        );
        setIsDeleting(false);
        return;
      }

      // 로그아웃 처리 (이미 삭제되었으므로 로컬 세션만 정리)
      await supabase.auth.signOut();

      // 탈퇴 완료 페이지로 이동
      router.push("/mypage/delete/complete");
    } catch (error) {
      console.error("Unexpected error during account deletion:", error);
      alert("예상치 못한 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <Link
          href="/mypage/edit"
          className="flex items-center gap-1 text-black hover:opacity-70"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} strokeWidth={2} />
          <span className="text-base font-medium">뒤로</span>
        </Link>
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold text-gray-900">
          회원탈퇴
        </h1>
        <div className="w-16" /> {/* 균형을 위한 빈 공간 */}
      </header>

      <div className="px-4 py-8 max-w-xl mx-auto">
        {step === "warning" ? (
          <div className="space-y-6">
            {/* 경고 아이콘 */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
            </div>

            {/* 제목 */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                정말 탈퇴하시겠어요?
              </h2>
              <p className="text-sm text-gray-500">
                탈퇴하시기 전에 아래 내용을 확인해주세요
              </p>
            </div>

            {/* 안내 사항 */}
            <div className="bg-gray-50 rounded-lg p-5 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  📌 탈퇴 시 삭제되는 정보
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 pl-4">
                  <li>• 프로필 정보 (이름, 소속국, 생년월일 등)</li>
                  <li>• 작성한 모든 큐티 묵상</li>
                  <li>• 좋아요 및 댓글 기록</li>
                  <li>• 활동 기록 및 뱃지</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  ⚠️ 영구 삭제 안내
                </h3>
                <p className="text-sm text-gray-600">
                  탈퇴 즉시 모든 데이터가{" "}
                  <strong className="text-red-600">영구적으로 삭제</strong>되며,
                  복구가 불가능합니다. 신중하게 결정해주세요.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  🔒 즉시 처리되는 사항
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 pl-4">
                  <li>• 계정 및 모든 데이터 영구 삭제</li>
                  <li>• 카카오 연결 해제 (재가입 시 동의 필요)</li>
                  <li>• 작성한 모든 게시물 삭제</li>
                </ul>
              </div>
            </div>

            {/* 버튼 */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="w-full py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                탈퇴 진행하기
              </button>
              <Link
                href="/mypage/edit"
                className="block w-full py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                취소
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 최종 확인 */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                최종 확인
              </h2>
              <p className="text-sm text-gray-500">
                정말로 탈퇴하시려면 아래에 &quot;회원탈퇴&quot;를 입력해주세요
              </p>
            </div>

            {/* 확인 입력 */}
            <div className="space-y-2">
              <label
                htmlFor="confirm-text"
                className="block text-sm font-medium text-gray-700"
              >
                확인 문구 입력
              </label>
              <input
                id="confirm-text"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="회원탈퇴"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500">
                정확히 &quot;회원탈퇴&quot;를 입력해주세요 (따옴표 제외)
              </p>
            </div>

            {/* 버튼 */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isDeleting || confirmText !== "회원탈퇴"}
                className="w-full py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "처리 중..." : "탈퇴하기"}
              </button>
              <button
                type="button"
                onClick={() => setStep("warning")}
                disabled={isDeleting}
                className="w-full py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                이전으로
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

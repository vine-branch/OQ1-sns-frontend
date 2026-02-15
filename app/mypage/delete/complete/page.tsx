"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function DeleteCompletePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 완료 아이콘 */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-500" />
          </div>
        </div>

        {/* 제목 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            회원탈퇴가 완료되었습니다
          </h1>
          <p className="text-sm text-gray-500">
            그동안 OQ1을 이용해주셔서 감사합니다
          </p>
        </div>

        {/* 안내 사항 */}
        <div className="bg-gray-50 rounded-lg p-5 text-center space-y-3">
          <p className="text-sm text-gray-600">
            모든 데이터가 안전하게 삭제되었습니다.
            <br />
            언제든지 다시 가입하실 수 있습니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="space-y-3 pt-4">
          <Link
            href="/login"
            className="block w-full py-3 text-sm font-semibold text-white bg-black rounded-lg hover:opacity-90 transition-opacity"
          >
            처음으로 돌아가기
          </Link>
        </div>

        <p className="text-xs text-gray-400 pt-4">
          문의사항이 있으시면 고객센터로 연락주세요
        </p>
      </div>
    </div>
  );
}

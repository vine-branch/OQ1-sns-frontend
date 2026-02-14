'use client';

import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-fafafa flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-4">비밀번호 찾기</h1>
        <p className="text-sm text-gray-600 mb-6">준비 중입니다.</p>
        <Link
          href="/login"
          className="inline-block text-sm font-semibold text-gray-900 hover:underline"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

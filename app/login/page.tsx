'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

function getKakaoAuthUrl(): string | null {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  if (!clientId || typeof window === 'undefined') return null;
  const redirectUri = `${window.location.origin}/api/auth/kakao/callback`;
  return `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
}

export default function LoginPage() {
  const router = useRouter();

  const handleKakaoLogin = () => {
    const url = getKakaoAuthUrl();
    if (url) {
      window.location.href = url;
    } else {
      // 개발 시: 카카오 키 미설정이면 홈으로 (실제 연동 시 API 라우트 + 콜백 라우트 구현)
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-fafafa flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-8 mb-4">
        <h1 className="text-2xl font-bold italic font-serif tracking-tight text-center text-gray-900">
          OQ1
        </h1>
        <p className="text-center text-sm font-medium text-gray-600 mt-1">오늘 큐티 완료</p>
        <p className="text-center text-xs text-gray-500 mt-2 mb-8">
          매일 QT를 나누고 사람을 연결하는 플랫폼
        </p>

        <button
          type="button"
          onClick={handleKakaoLogin}
          className="w-full py-3 flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#FADA0A] active:bg-[#E6D000] text-[#191919] text-sm font-semibold rounded-md transition-colors"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.966C1.5 6.665 6.201 3 12 3Z" />
          </svg>
          카카오로 로그인
        </button>
        <p className="text-center text-xs text-gray-500 mt-4">
          카카오 계정 하나로 로그인·가입됩니다. 처음 이용 시 다음 단계에서 회원 정보를 입력해 주세요.
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

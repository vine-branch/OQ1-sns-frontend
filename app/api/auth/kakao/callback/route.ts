import { NextRequest, NextResponse } from 'next/server';

/**
 * 카카오 OAuth 콜백.
 * 쿼리: code (인가 코드)
 * TODO: code로 액세스 토큰 발급 후 회원 조회/생성, 세션 설정
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=kakao', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // TODO: code로 토큰 발급 후 사용자 조회, oq_users에 있으면 세션 설정 후 /
  // 신규 사용자: 회원가입(다음 스텝)으로 보냄. 실제 구현 시 code/토큰을 쿠키 등에 잠시 보관 후 signup에서 사용
  const signupUrl = new URL('/signup', request.url);
  signupUrl.searchParams.set('from', 'kakao');
  return NextResponse.redirect(signupUrl);
}

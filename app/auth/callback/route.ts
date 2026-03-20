import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Supabase OAuth Callback Handler
 * - Exchanges auth code for session
 * - Checks user profile status using Admin privileges (bypassing RLS)
 * - Redirects to appropriate page (Home, Signup, or Reactivate)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // 1. Handle OAuth Errors
  if (error) {
    const params = new URLSearchParams({
      error,
      ...(errorDescription && { error_description: errorDescription }),
    });
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
    // 2. Exchange Code for Session (Standard Client)
    const supabase = await createClient();
    const { error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("Session exchange error:", sessionError);
      return NextResponse.redirect(`${origin}/login?error=auth_error`);
    }

    // 3. Get Authenticated User
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=no_user`);
    }

    console.log("✅ Auth successful for user:", user.id);

    // 4. Check User Profile Status (Admin Client to bypass RLS)
    // RLS 정책과 상관없이 데이터 존재 여부를 확실히 체크하기 위함
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data: profile } = await supabaseAdmin
      .from("oq_users")
      .select("birth_date") // 필수 정보 조회
      .eq("id", user.id)
      .single();

    // 5. Routing Logic based on Profile Status

    // Case A: 신규 유저 판단 (프로필이 없거나, 필수 정보가 비어있음)
    // 트리거가 oq_users 행을 자동 생성하므로, 행 존재 여부만으로는 판단 불가!
    // birth_date가 없으면 아직 가입 절차를 완료하지 않은 것으로 판단
    const isNewUser = !profile || !profile.birth_date;

    if (isNewUser) {
      return NextResponse.redirect(`${origin}/signup?from=kakao`);
    }

    // Case B: 정상 기존 유저 -> 홈으로
    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error("Unexpected error in auth callback:", err);
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}

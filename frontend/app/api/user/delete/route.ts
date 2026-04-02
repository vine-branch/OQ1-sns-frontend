import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Supabase Admin Client (서버 측에서만 사용)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service Role Key 필요!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function POST(request: NextRequest) {
  try {
    // 1. 요청에서 사용자 토큰 가져오기
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // 2. 토큰으로 사용자 확인 (Admin 클라이언트 사용)
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("Invalid token or user not found:", userError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = user.id; // 타입 안전하게 ID 추출

    // 3. 요청 본문에서 provider_token 가져오기
    const body = await request.json();
    const providerToken = body.provider_token;

    // 4. 카카오 연결 끊기 (카카오 사용자인 경우)
    const isKakaoUser = user.app_metadata?.provider === "kakao";
    if (isKakaoUser && providerToken) {
      try {
        const unlinkResponse = await fetch(
          "https://kapi.kakao.com/v1/user/unlink",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${providerToken}`,
            },
          },
        );

        if (unlinkResponse.ok) {
          console.log("카카오 연결 끊기 성공");
        } else {
          console.warn("카카오 연결 끊기 실패:", await unlinkResponse.text());
        }
      } catch (kakaoError) {
        console.error("카카오 연결 끊기 중 오류:", kakaoError);
      }
    }

    // 5. oq_users 테이블에서 명시적으로 삭제 (CASCADE 의존 X, 확실한 정리)
    const { error: profileDeleteError } = await supabaseAdmin
      .from("oq_users")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error("Profile deletion error (non-fatal):", profileDeleteError);
      // 프로필 삭제 실패해도 계정 삭제 시도 계속 (CASCADE가 처리할 수도 있으므로)
    }

    // 6. Admin API로 사용자 영구 삭제 (Auth User)
    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("User deletion error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete user", details: deleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

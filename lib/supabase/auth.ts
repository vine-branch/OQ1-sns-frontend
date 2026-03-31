import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "./server";

/**
 * 서버 컴포넌트에서 현재 유저를 가져옵니다.
 * React.cache()로 동일 요청 내 중복 호출을 제거합니다.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * 인증을 요구하고 유저 + 프로필을 반환합니다.
 * 미인증 시 /login으로 리다이렉트합니다.
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  return { profile };
}

/**
 * 서버 컴포넌트에서 현재 유저의 oq_users 프로필을 가져옵니다.
 * React.cache()로 동일 요청 내 중복 호출을 제거합니다.
 * fetchUserProfile()과 동일한 shape을 반환합니다.
 */
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("oq_users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    avatar_url: data.avatar_url || "",
  };
});

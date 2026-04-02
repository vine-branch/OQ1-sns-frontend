import { getProfile, getUser } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SignupClientContent from "./SignupClientContent";

export const metadata: Metadata = {
  title: "회원가입",
  description: "OQ1에 가입하고 매일 QT 묵상을 나눠보세요.",
};

export default async function SignupPage() {
  const user = await getUser();

  // 인증 + 가입 완료 → 홈으로
  if (user) {
    const profile = await getProfile(user.id);
    if (profile?.birth_date) redirect("/");
  }

  // 미인증 또는 미가입 → signup UI 표시
  return <SignupClientContent isAuthenticated={!!user} />;
}

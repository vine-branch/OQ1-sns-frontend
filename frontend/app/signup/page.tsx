import { getProfile, getUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import SignupClientContent from "./SignupClientContent";

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

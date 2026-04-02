import { requireAuth } from "@/lib/supabase/auth";
import MyPageContent from "./MyPageContent";

export default async function MyPage() {
  const { profile } = await requireAuth();
  return <MyPageContent userId={profile!.id} initialProfile={profile} />;
}

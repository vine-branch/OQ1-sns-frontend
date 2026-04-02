import { requireAuth } from "@/lib/supabase/auth";
import UploadContent from "./UploadContent";

export default async function UploadPage() {
  const { profile } = await requireAuth();

  return (
    <UploadContent
      userName={profile?.user_name || "나"}
      avatarUrl={profile?.avatar_url || null}
    />
  );
}

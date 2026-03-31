import { requireAuth } from "@/lib/supabase/auth";
import HomeContent from "./HomeContent";

export default async function HomePage() {
  const { profile } = await requireAuth();

  return (
    <HomeContent
      userId={profile.id}
      enneagramType={profile.enneagram_type ?? null}
    />
  );
}

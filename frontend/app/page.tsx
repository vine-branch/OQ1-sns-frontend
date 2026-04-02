import { requireAuth } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import HomeContent from "./HomeContent";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function HomePage() {
  const { profile } = await requireAuth();

  return (
    <HomeContent
      userId={profile.id}
      enneagramType={profile.enneagram_type ?? null}
    />
  );
}

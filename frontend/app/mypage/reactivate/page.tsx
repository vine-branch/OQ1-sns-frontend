import { requireAuth } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import ReactivateContent from "./ReactivateContent";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ReactivatePage() {
  await requireAuth();
  return <ReactivateContent />;
}

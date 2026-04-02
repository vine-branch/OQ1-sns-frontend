import { requireAuth } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import DeleteContent from "./DeleteContent";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DeletePage() {
  await requireAuth();
  return <DeleteContent />;
}

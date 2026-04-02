import { requireAuth } from "@/lib/supabase/auth";
import type { Metadata } from "next";
import EditContent from "./EditContent";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EditPage() {
  const { profile } = await requireAuth();
  return <EditContent userId={profile!.id} />;
}

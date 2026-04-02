import { requireAuth } from "@/lib/supabase/auth";
import ReactivateContent from "./ReactivateContent";

export default async function ReactivatePage() {
  await requireAuth();
  return <ReactivateContent />;
}

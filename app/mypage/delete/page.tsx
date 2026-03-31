import { requireAuth } from "@/lib/supabase/auth";
import DeleteContent from "./DeleteContent";

export default async function DeletePage() {
  await requireAuth();
  return <DeleteContent />;
}

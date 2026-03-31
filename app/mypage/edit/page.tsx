import { requireAuth } from "@/lib/supabase/auth";
import EditContent from "./EditContent";

export default async function EditPage() {
  const { profile } = await requireAuth();
  return <EditContent userId={profile!.id} />;
}

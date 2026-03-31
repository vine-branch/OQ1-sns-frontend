import { redirectIfAuthenticated } from "@/lib/supabase/auth";
import LoginPageContent from "./LoginContent";

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginPageContent />;
}

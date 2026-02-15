"use client";

import { createClient } from "@/lib/supabase/client";
import type { SignupFormData } from "@/app/signup/schema";
import { useRouter } from "next/navigation";

export function useSignupSubmit(fromKakao: boolean) {
  const router = useRouter();

  const submitSignup = async (data: SignupFormData) => {
    if (fromKakao) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("로그인 세션이 없습니다. 카카오로 다시 로그인해 주세요.");
        router.push("/login");
        return;
      }
      const { error } = await supabase
        .from("oq_users")
        .update({
          user_name: data.user_name,
          guk_no: data.guk_no,
          birth_date: data.birth_date,
          leader_name: data.leader_name,
          enneagram_type: data.enneagram_type,
        })
        .eq("id", user.id);
      if (error) {
        console.error("oq_users update error:", error);
        alert("회원 정보 저장에 실패했습니다.");
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      router.push("/login");
    }
  };

  return submitSignup;
}

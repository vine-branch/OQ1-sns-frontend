"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";

export type State = {
  errors?: {
    content?: string[];
    qtId?: string[];
    isAnonymous?: string[];
  };
  message?: string;
  success?: boolean;
};

const FormSchema = {
  content: (value: string) => value.length >= 10 && value.length <= 2200,
  qtId: (value: string) => value.length > 0,
};

export async function createPost(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient();

  // Phase 1: 인증을 최우선으로 확인 (server-auth-actions)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "함께 나누기 위해 로그인이 먼저 필요해요! 😊",
      success: false,
    };
  }

  const content = formData.get("content") as string;
  const qtId = formData.get("qtId") as string;
  const isAnonymous = formData.get("isAnonymous") === "true";

  const validatedContent = FormSchema.content(content);
  const validatedQtId = FormSchema.qtId(qtId);

  if (!validatedContent || !validatedQtId) {
    return {
      errors: {
        content: !validatedContent
          ? content.length < 10
            ? ["묵상의 깊이를 더하기 위해 10자 이상 조금 더 적어주세요. ✨"]
            : [
                "풍성한 묵상도 좋지만, 2,200자 이내로 정리해주시면 감사할 것 같아요. 😊",
              ]
          : undefined,
        qtId: !validatedQtId
          ? ["오늘의 말씀 정보가 없어요. 잠시 후에 다시 시도해 보시겠어요?"]
          : undefined,
      },
      message: "작성하신 내용을 다시 한번만 확인해 주시겠어요? 🤍",
      success: false,
    };
  }

  // Sanitization: Remove all HTML tags
  const cleanContent = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });

  const postId = formData.get("postId")?.toString();

  let error;

  if (postId) {
    // 소유권 검증: 본인 게시물만 수정 가능
    const { data: existing } = await supabase
      .from("oq_user_qt_answers")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return {
        message: "본인의 묵상만 수정할 수 있어요.",
        success: false,
      };
    }

    const { error: updateError } = await supabase
      .from("oq_user_qt_answers")
      .update({
        meditation: cleanContent,
        is_public: !isAnonymous,
      })
      .eq("id", postId)
      .eq("user_id", user.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("oq_user_qt_answers")
      .insert({
        user_id: user.id,
        daily_qt_id: qtId,
        meditation: cleanContent,
        is_public: !isAnonymous,
      });
    error = insertError;
  }

  if (error) {
    console.error("DB Error Details:", JSON.stringify(error, null, 2));
    return {
      message: "오늘의 큐티를 이미 정성껏 작성하셨네요! 내일 또 만나요. ✨",
      success: false,
    };
  }

  revalidatePath("/");
  return {
    message: "오늘의 묵상이 소중하게 기록되었어요! ✨",
    success: true,
  };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";

export type State = {
  errors?: {
    content?: string[];
    qtId?: string[];
    isAnonymous?: string[];
    tags?: string[];
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

  const content = formData.get("content") as string;
  const qtId = formData.get("qtId") as string;
  const isAnonymous = formData.get("isAnonymous") === "true";

  // const _tagsJson = formData.get("tags") as string; // Currently unused

  const validatedContent = FormSchema.content(content);
  const validatedQtId = FormSchema.qtId(qtId);

  if (!validatedContent || !validatedQtId) {
    return {
      errors: {
        content: !validatedContent
          ? content.length < 10
            ? ["묵상 내용을 10자 이상 적어주세요."]
            : ["묵상 내용은 2,200자 이내로 적어주세요."]
          : undefined,
        qtId: !validatedQtId ? ["오늘의 말씀 정보가 없습니다."] : undefined,
      },
      message: "입력 내용을 확인해주세요.",
      success: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "로그인이 필요합니다.",
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
        answer_type: "A",
      });
    error = insertError;
  }

  if (error) {
    console.error("DB Error Details:", JSON.stringify(error, null, 2));
    return {
      message: "데이터베이스 저장 실패",
      success: false,
    };
  }

  revalidatePath("/");
  return {
    message: "업로드 성공",
    success: true,
  };
}

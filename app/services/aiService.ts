"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

import { unstable_cache } from "next/cache";

/**
 * API 키가 없을 때는 AI 호출을 하지 않음.
 * 배포/프리렌더 시 에러를 막기 위해 임시로 처리됨.
 */
function hasApiKey() {
  return !!process.env.GEMINI_API_KEY;
}

// 환경변수 GEMINI_API_KEY를 명시적으로 주입하여 프로바이더 생성
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const getDailyInsight = async (scripture: string): Promise<string> => {
  if (!hasApiKey()) {
    // API 키 미설정 시 임시로 AI 호출 없이 안내 문구만 반환
    return "현재 AI 묵상 도우미를 사용할 수 없습니다.";
  }

  // Next.js Data Cache를 활용하여 동일한 성경 구절에 대한 AI 요청 캐싱
  const getCachedInsight = unstable_cache(
    async (scriptureText: string) => {
      try {
        const { text } = await generateText({
          model: google("gemini-2.5-flash"), // 모델 스위칭이 용이함
          prompt: `다음 성경 구절을 읽고, 오늘 하루 적용할 수 있는 묵상 질문을 작성해줘. 
          친근하고 따뜻한 어조로, 마크다운 문법 제외하고 텍스트로만 응답해줘.
          
          성경 본문: ${scriptureText}`,
        });
        return text || "묵상 내용을 불러오는 중 오류가 발생했습니다.";
      } catch (error) {
        console.error("AI Error:", error);
        return "현재 AI 묵상 도우미를 사용할 수 없습니다.";
      }
    },
    ["daily-insight-cache"], // 캐시 키 네임스페이스
    {
      revalidate: 60 * 60 * 24, // 하루(24시간) 동안 캐싱
      tags: ["daily-insight"],
    },
  );

  return getCachedInsight(scripture);
};

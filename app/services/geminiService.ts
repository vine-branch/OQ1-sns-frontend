import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getDailyInsight = async (scripture: string): Promise<string> => {
  if (!apiKey) {
    return "API Key가 설정되지 않았습니다. (개발 모드)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `다음 성경 구절을 읽고, 오늘 하루 적용할 수 있는 짧고 깊은 묵상 질문이나 한 문장의 기도를 작성해줘. 
      친근하고 따뜻한 어조로, 150자 이내로.
      
      성경 본문: ${scripture}`,
    });
    return response.text || "묵상 내용을 불러오는 중 오류가 발생했습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "현재 AI 묵상 도우미를 사용할 수 없습니다.";
  }
};

export const generatePrayerFromReflection = async (reflection: string): Promise<string> => {
  if (!apiKey) {
    return "주님, 저의 마음을 받아주소서. (API Key 미설정)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `사용자가 작성한 다음 큐티 묵상 내용을 바탕으로, 진실되고 간절한 마무리 기도문을 작성해줘.
      3문장 정도의 길이로 작성해줘.
      
      묵상 내용: ${reflection}`,
    });
    return response.text || "기도문을 생성하지 못했습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "기도문 생성 중 오류가 발생했습니다.";
  }
};
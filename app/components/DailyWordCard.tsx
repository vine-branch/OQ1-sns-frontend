"use client";

import { createClient } from "@/lib/supabase/client";
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getDailyInsight } from "../services/aiService";
import type { DailyWord } from "../types";

interface Props {
  /** demo 페이지 전용: 실제 데이터가 없을 때 표시할 목데이터 */
  demoData?: DailyWord;
}

const DailyWordCard = ({ demoData }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [showExpand, setShowExpand] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qtLoading, setQtLoading] = useState(true);
  const contentRef = useRef<HTMLParagraphElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dailyQt, setDailyQt] = useState<any>(null);

  useEffect(() => {
    const fetchTodayQt = async () => {
      const supabase = createClient();
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      let { data: qtData } = await supabase
        .from("oq_daily_qt")
        .select("*")
        .eq("qt_date", todayStr)
        .single();

      if (!qtData) {
        const { data: latestQt } = await supabase
          .from("oq_daily_qt")
          .select("*")
          .order("qt_date", { ascending: false })
          .limit(1)
          .single();
        qtData = latestQt;
      }
      if (qtData) {
        setDailyQt(qtData);
      }
      setQtLoading(false);
    };
    fetchTodayQt();
  }, []);

  // 콘텐츠가 4줄(96px) 초과일 때만 더보기 표시
  useEffect(() => {
    if (!contentRef.current) return;
    const timer = setTimeout(() => {
      if (contentRef.current) {
        setShowExpand(contentRef.current.scrollHeight > 96);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [dailyQt, demoData]);

  const handleGetInsight = async () => {
    const content = dailyQt?.content ?? demoData?.text;
    if (!content || insight) return;
    setLoading(true);
    const result = await getDailyInsight(content);
    setInsight(result);
    setLoading(false);
  };

  const data = dailyQt
    ? {
        date: new Date(dailyQt.qt_date).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        reference: `${dailyQt.bible_book} ${dailyQt.chapter}:${dailyQt.verse_from}-${dailyQt.verse_to}`,
        content: dailyQt.content,
        keyVerse: "오늘의 묵상 본문을 읽고 은혜를 나누어보세요.",
      }
    : demoData
      ? {
          date: demoData.date,
          reference: demoData.reference,
          content: demoData.text,
          keyVerse: demoData.keyVerse,
        }
      : null;

  return (
    <div className="bg-white md:rounded-lg border-b md:border border-gray-200 mb-6 overflow-hidden">
      {/* Instagram Story-like Header */}
      <div className="bg-linear-to-r from-pink-500 via-red-500 to-yellow-500 px-5 py-4 flex justify-between items-center text-white">
        <div className="flex-1 min-w-0">
          {qtLoading || !data ? (
            <>
              <div className="h-3 w-28 bg-white/30 rounded animate-pulse mb-2" />
              <div className="h-5 w-36 bg-white/30 rounded animate-pulse" />
            </>
          ) : (
            <>
              <h2 className="text-xs font-semibold opacity-90 uppercase tracking-wider">
                {data.date}
              </h2>
              <h1 className="text-lg font-bold mt-0.5">{data.reference}</h1>
            </>
          )}
        </div>
        <BookOpen className="opacity-90 shrink-0 ml-3" size={20} />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3">오늘의 말씀</h3>

        {qtLoading ? (
          <div className="animate-pulse space-y-2 mb-3">
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded mt-2"></div>
          </div>
        ) : data ? (
          <>
            <div
              className={`relative ${showExpand && !expanded ? "max-h-24 overflow-hidden" : ""} transition-all duration-300`}
            >
              <p
                ref={contentRef}
                className="text-gray-800 leading-relaxed whitespace-pre-line text-sm md:text-base font-light"
              >
                {data.content}
              </p>
              {showExpand && !expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent" />
              )}
            </div>

            {showExpand && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex justify-center items-center gap-1 mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                {expanded ? (
                  <>
                    접기 <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    더 보기 <ChevronDown size={14} />
                  </>
                )}
              </button>
            )}
          </>
        ) : null}

        <div className="mt-5 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300 italic">
          {qtLoading ? (
            <div className="animate-pulse space-y-1.5">
              <div className="h-3.5 w-full bg-gray-200 rounded" />
              <div className="h-3.5 w-4/5 bg-gray-200 rounded" />
            </div>
          ) : data ? (
            <p className="text-gray-600 font-medium text-sm">
              &ldquo;{data.keyVerse}&rdquo;
            </p>
          ) : null}
        </div>

        {/* AI Insight Section */}
        {data && (
          <div className="mt-5">
            {!insight && !loading && (
              <button
                onClick={handleGetInsight}
                className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Sparkles size={16} className="text-yellow-500" />
                <span>AI 묵상 질문 보기</span>
              </button>
            )}

            {loading && (
              <div className="w-full py-4 flex justify-center items-center text-gray-400 gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                <span className="text-sm">생각하는 중...</span>
              </div>
            )}

            {insight && (
              <div className="bg-linear-to-r from-purple-50 to-pink-50 p-4 rounded-lg animate-fade-in border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-purple-600">
                    <Sparkles size={16} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      묵상 포인트
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {insight}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyWordCard;

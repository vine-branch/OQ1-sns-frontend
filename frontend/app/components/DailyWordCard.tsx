"use client";

import { formatDate } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Pencil,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { getDailyInsight } from "../services/aiService";
import { fetchTodayQt } from "../services/postService";
import type { DailyWord } from "../types";

interface Props {
  /** demo 페이지 전용: 실제 데이터가 없을 때 표시할 목데이터 */
  demoData?: DailyWord;
}

const DailyWordCard = ({ demoData }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [showExpand, setShowExpand] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qtLoading, setQtLoading] = useState(true);
  const { copied, copy } = useCopyToClipboard({
    successMessage: "말씀이 복사되었습니다",
  });
  const contentRef = useRef<HTMLParagraphElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dailyQt, setDailyQt] = useState<any>(null);

  useEffect(() => {
    const initDailyWord = async () => {
      const qtData = await fetchTodayQt();
      if (qtData) {
        setDailyQt(qtData);
      }
      setQtLoading(false);
    };
    initDailyWord();
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
        date: formatDate(dailyQt.qt_date, "yyyy년 M월 d일"),
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">오늘의 말씀</h3>
          {!qtLoading && data && (
            <motion.button
              onClick={() => copy(`${data.reference}\n${data.content}`)}
              aria-label="말씀 복사"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              animate={copied ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut", times: [0, 0.4, 1] }}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    <Check size={16} className="text-green-600" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    <Copy size={16} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>

        {qtLoading ? (
          <div className="animate-pulse space-y-2 mb-3">
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded mt-2"></div>
          </div>
        ) : data ? (
          <>
            <motion.div
              initial={false}
              animate={{ height: showExpand && !expanded ? 96 : "auto" }}
              transition={{
                duration: hasInteracted ? 0.3 : 0,
                ease: "easeInOut",
              }}
              className="relative overflow-hidden"
            >
              <p
                ref={contentRef}
                className="text-gray-800 leading-relaxed whitespace-pre-line text-sm md:text-base font-light"
              >
                {data.content}
              </p>
              <AnimatePresence>
                {showExpand && !expanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent"
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {showExpand && (
              <button
                onClick={() => {
                  setHasInteracted(true);
                  setExpanded(!expanded);
                }}
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
                      오늘의 묵상 질문
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {typeof insight === "string"
                        ? insight.replace(/\\n/g, "\n")
                        : insight}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300 italic flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {qtLoading ? (
            <div className="animate-pulse space-y-1.5 flex-1 w-full">
              <div className="h-3.5 w-full bg-gray-200 rounded" />
              <div className="h-3.5 w-4/5 bg-gray-200 rounded" />
            </div>
          ) : data ? (
            <>
              <p className="text-gray-600 font-medium text-sm flex-1">
                &ldquo;{data.keyVerse}&rdquo;
              </p>
              <Link
                href="/upload"
                className="shrink-0 group relative overflow-hidden bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:bg-gray-800 transition-all duration-300 hover:-translate-y-0.5 not-italic"
              >
                <Pencil
                  size={15}
                  className="relative z-10 group-hover:rotate-12 transition-transform duration-300"
                />
                <span className="relative z-10">큐티 작성하러 가기</span>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DailyWordCard;

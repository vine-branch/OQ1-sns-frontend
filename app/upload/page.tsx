"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { isFeatureEnabled, sanitizeText } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Home,
  Image as ImageIcon,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  Suspense,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { getDailyInsight } from "../services/aiService";
import { createPost, State } from "./actions";

// ─── Animation Helpers ────────────────────────────────────────────────────
const fadeRise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" as const, delay },
});

// ─── Type Definitions ─────────────────────────────────────────────────────
interface DailyQt {
  id: string;
  qt_date: string;
  bible_book: string;
  chapter: number;
  verse_from: number;
  verse_to: number;
  content?: string;
}

const initialState: State = { message: undefined, errors: {} };

function UploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPostId = searchParams.get("id");

  // Server Action State (React 19)
  const [state, formAction, isPending] = useActionState(
    createPost,
    initialState,
  );

  // Data States (Typed)
  const [user, setUser] = useState<User | null>(null);
  const [dailyQt, setDailyQt] = useState<DailyQt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
  const [showQuoteExpand, setShowQuoteExpand] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quoteContentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Check Action Success
    if (state.success) {
      const timer = setTimeout(() => setShowReward(true), 0);
      return () => clearTimeout(timer);
    } else if (state.message) {
      alert(state.message);
    }
  }, [state]);

  useEffect(() => {
    if (showReward) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
      };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: ReturnType<typeof setInterval> = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showReward]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      // 1. Auth check
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 2. Fetch Data (Edit Mode or Today's QT)
      if (editPostId) {
        const { data: postData } = await supabase
          .from("oq_user_qt_answers")
          .select("*, daily_qt:daily_qt_id(*)")
          .eq("id", editPostId)
          .single();

        if (postData) {
          setContent(postData.meditation);
          setIsAnonymous(!postData.is_public);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setDailyQt(postData.daily_qt as any as DailyQt);
        }
      } else {
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
          setDailyQt(qtData as DailyQt);
        }
      }

      setIsLoading(false);
    };
    init();
  }, [router, editPostId]);

  // 콘텐츠가 4줄(96px) 초과일 때만 더보기 표시
  useEffect(() => {
    if (!quoteContentRef.current) return;
    const timer = setTimeout(() => {
      if (quoteContentRef.current) {
        setShowQuoteExpand(quoteContentRef.current.scrollHeight > 96);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [dailyQt]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // IME composing check

    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = sanitizeText(tagInput);
      if (cleanTag && cleanTag.length <= 20 && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      } else if (cleanTag.length > 20) {
        alert("태그는 20자 이내로 입력해 주세요.");
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleGenerateInsight = async () => {
    const scripture = dailyQt?.content;
    if (!scripture) {
      alert("오늘의 성경 본문을 불러오지 못했습니다.");
      return;
    }
    setIsGeneratingInsight(true);
    const insight = await getDailyInsight(scripture);
    const formattedInsight = `Q. ${insight}`;
    setContent((prev) => [prev, formattedInsight].filter(Boolean).join("\n\n"));
    setIsGeneratingInsight(false);
  };

  const handleCloseReward = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const userAvatar =
    user?.user_metadata?.avatar_url ||
    "https://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_640x640.jpg";

  return (
    <form
      action={formAction}
      className="bg-white min-h-screen pb-20 md:pb-8 relative"
    >
      {/* Hidden Inputs for Form Data */}
      <input type="hidden" name="postId" value={editPostId || ""} />
      <input type="hidden" name="qtId" value={dailyQt?.id || ""} />
      <input type="hidden" name="isAnonymous" value={String(isAnonymous)} />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />
      {/* Content is handled by textarea name="content" directly */}

      {/* ── Ambient Floating Particles ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-pink-200/20 blur-3xl"
          style={{ top: "8%", right: "-10%" }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.38, 0.2] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full bg-blue-200/15 blur-3xl"
          style={{ bottom: "20%", left: "-8%" }}
          animate={{ y: [0, 14, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: 3,
          }}
        />
      </div>

      {/* Reward Overlay */}
      {showReward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" as const, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
          >
            {/* Background Gradient Blob */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-50"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-linear-to-tr from-yellow-300 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 text-white shadow-lg">
                <Trophy size={40} strokeWidth={1.5} />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                인증 완료!
              </h2>
              <p className="text-gray-500 mb-8 text-sm">
                오늘도 말씀을 통해 승리하셨군요!
              </p>

              {/* TODO: Implement logic for EXP and Consecutive Days */}
              {isFeatureEnabled("rewardStats") && (
                <div className="space-y-3 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                    <span className="text-sm font-semibold text-gray-600">
                      획득 경험치
                    </span>
                    <span className="text-sm font-bold text-blue-500">
                      +50 EXP
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                    <span className="text-sm font-semibold text-gray-600">
                      연속 묵상
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-orange-500">
                        1일째
                      </span>
                      <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">
                        HOT
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCloseReward}
                className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                <Home size={18} />
                <span>홈으로 돌아가기</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Header - Instagram Style */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-12">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-base font-normal text-gray-900 hover:opacity-70"
        >
          취소
        </button>
        <h1 className="text-base font-bold text-gray-900">
          {editPostId ? "큐티 수정하기" : "큐티 작성하기"}
        </h1>
        <button
          type="submit"
          disabled={isPending || content.length < 10 || !dailyQt}
          className={`text-base font-bold transition-colors ${
            content.length >= 10 && dailyQt && !isPending
              ? "text-blue-500 hover:text-blue-700 cursor-pointer"
              : "text-blue-200 cursor-default"
          }`}
        >
          {isPending ? "처리 중..." : "저장"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Today's Word Quote */}
        {dailyQt && (
          <motion.div
            {...fadeRise(0)}
            className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300 mx-4 mt-4 mb-2"
          >
            <h2 className="font-bold text-gray-900 text-sm mb-2">
              {dailyQt.bible_book} {dailyQt.chapter}:{dailyQt.verse_from}-
              {dailyQt.verse_to}
            </h2>
            <div
              className={`relative ${
                showQuoteExpand && !isQuoteExpanded
                  ? "max-h-24 overflow-hidden"
                  : ""
              } transition-all duration-300`}
            >
              <p
                ref={quoteContentRef}
                className="text-sm text-gray-600 leading-relaxed whitespace-pre-line italic"
              >
                {dailyQt.content
                  ? typeof dailyQt.content === "string"
                    ? dailyQt.content.split("\\n").join("\n")
                    : dailyQt.content
                  : "묵상 말씀을 읽어보세요."}
              </p>
              {showQuoteExpand && !isQuoteExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-gray-50 to-transparent" />
              )}
            </div>
            {showQuoteExpand && (
              <button
                onClick={() => setIsQuoteExpanded(!isQuoteExpanded)}
                className="w-full flex justify-center items-center gap-1 mt-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                {isQuoteExpanded ? (
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
          </motion.div>
        )}

        {/* Content Area: Image (Left) + Text (Right) Split View */}
        <motion.div
          {...fadeRise(0.15)}
          className="flex p-4 gap-4 border-b border-gray-100"
        >
          {/* Left: Thumbnail */}
          <div className="shrink-0 pt-1">
            {image ? (
              <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded overflow-hidden border border-gray-200">
                <Image
                  src={image}
                  alt="Selected"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 rounded-full hover:bg-black/80"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                <Image
                  src={userAvatar}
                  alt="Me"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Right: Text Editor */}
          <div className="flex-1">
            <Textarea
              name="content" // Server Action binds to this name
              className="w-full h-32 md:h-40 p-0 text-base placeholder:text-gray-400 border-none resize-none leading-relaxed bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none focus-visible:outline-none"
              placeholder="묵상 내용을 10자 이상 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2200}
            />
            {state.errors?.content && (
              <p className="text-red-500 text-xs mt-1">
                {state.errors.content[0]}
              </p>
            )}

            {/* AI Generation Button */}
            <div className="flex justify-end mt-2">
              <button
                onClick={handleGenerateInsight}
                disabled={isGeneratingInsight}
                className="text-xs font-semibold text-purple-600 flex items-center gap-1 bg-purple-50 px-2.5 py-1.5 rounded-md hover:bg-purple-100 transition-colors"
                type="button"
              >
                {isGeneratingInsight ? (
                  <Sparkles size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                AI 묵상 질문
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tools List */}
        <motion.div
          {...fadeRise(0.3)}
          className="divide-y divide-gray-100 border-b border-gray-100"
        >
          {/* Action: Add Photo (미지원으로 임시 숨김) */}
          {isFeatureEnabled("photoUpload") && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-between py-3.5 px-4 cursor-pointer active:bg-gray-50 transition-colors"
            >
              <span className="text-base text-gray-900">사진 추가</span>
              <div className="flex items-center gap-2">
                {image && (
                  <span className="text-xs text-blue-500 font-medium">
                    1장 선택됨
                  </span>
                )}
                <ImageIcon size={20} className="text-gray-400" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                name="image" // Prepare for server upload
              />
            </div>
          )}

          {/* Action: Tags (미지원으로 임시 숨김) */}
          {isFeatureEnabled("tags") && (
            <div className="py-3.5 px-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base text-gray-900">태그</span>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-end max-w-[70%]">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-medium flex items-center gap-1 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag} <X size={8} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Input
                type="text"
                placeholder="태그 입력... (Enter)"
                className="w-full text-sm bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 shadow-none h-auto"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                // Prevent form submission on Enter
                onKeyPress={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
            </div>
          )}

          {/* Action: Anonymous Toggle */}
          <div className="flex items-center justify-between py-3.5 px-4">
            <div className="flex flex-col">
              <span className="text-base text-gray-900">나만 보기</span>
              <span className="text-xs text-gray-400 mt-0.5">
                피드에 공개되지 않습니다.
              </span>
            </div>
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isAnonymous ? "bg-black" : "bg-gray-200"
              }`}
              type="button"
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${
                  isAnonymous ? "left-5.5" : "left-0.5"
                }`}
              ></div>
            </button>
          </div>
        </motion.div>
      </div>
    </form>
  );
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <UploadForm />
    </Suspense>
  );
}

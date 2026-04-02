"use client";

import { formatDate, isSameDayCheck } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import DailyWordCard from "./components/DailyWordCard";
import FeedItem from "./components/FeedItem";
import { MobileHeader } from "./components/MobileHeader";
import { usePosts } from "./hooks/useQueries";
import { FeedFilter } from "./types";

// ─── Animation Variants ────────────────────────────────────────────────────

/** Fade & Rise: 아래에서 위로 부드럽게 떠오르는 입장 애니메이션 */
const fadeRise = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const, delay },
});

/** Stagger: index 기반으로 딜레이 계산 (8개 이상은 캡) */
const feedItemTransition = (index: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.4,
    ease: "easeOut" as const,
    delay: 0.35 + Math.min(index, 8) * 0.07,
  },
});

// ─── Ambient Floating Particles ───────────────────────────────────────────

const particles = [
  {
    className: "absolute w-72 h-72 rounded-full bg-pink-200/20 blur-3xl",
    style: { top: "5%", left: "-15%" },
    animate: { y: [0, -24, 0], opacity: [0.25, 0.45, 0.25] },
    transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const },
  },
  {
    className: "absolute w-56 h-56 rounded-full bg-amber-200/20 blur-3xl",
    style: { top: "35%", right: "-12%" },
    animate: { y: [0, 18, 0], opacity: [0.2, 0.38, 0.2] },
    transition: {
      duration: 9,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: 2.5,
    },
  },
  {
    className: "absolute w-40 h-40 rounded-full bg-blue-200/15 blur-2xl",
    style: { bottom: "25%", left: "15%" },
    animate: { y: [0, -12, 0], opacity: [0.15, 0.28, 0.15] },
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: 1,
    },
  },
];

// ──────────────────────────────────────────────────────────────────────────

export default function HomeContent({
  userId,
  enneagramType,
}: {
  userId: string;
  enneagramType: string | null;
}) {
  const [filter, setFilter] = useState<FeedFilter>(FeedFilter.ALL);

  const { data: posts = [], isLoading: loading } = usePosts(userId);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filter === FeedFilter.MY_TYPE) {
        if (!enneagramType) return true;
        return post.user.enneagramType?.[0] === enneagramType[0];
      }
      return true;
    });
  }, [posts, filter, enneagramType]);

  return (
    <div className="relative pb-20 md:py-8 px-0">
      {/* ── Ambient Floating Particles (배경 앰비언트 모션) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className={p.className}
            style={p.style}
            animate={p.animate}
            transition={p.transition}
          />
        ))}
      </div>

      <MobileHeader />

      <div className="md:px-4 mt-2 md:mt-0">
        {/* ── DailyWordCard: Fade & Rise (delay 0) ── */}
        <motion.div {...fadeRise(0)}>
          <DailyWordCard />
        </motion.div>

        {/* ── 필터 버튼: Fade & Rise (delay 0.2) ── */}
        <motion.div
          {...fadeRise(0.2)}
          className="px-4 md:px-0 flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2"
        >
          <button
            onClick={() => setFilter(FeedFilter.ALL)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${filter === FeedFilter.ALL ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
          >
            전체 보기
          </button>
          <button
            onClick={() => setFilter(FeedFilter.MY_TYPE)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${filter === FeedFilter.MY_TYPE ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
          >
            🧩 나와 같은 타입
          </button>
        </motion.div>

        {/* ── 피드 목록: Stagger Loading ── */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border-b border-gray-200 md:border md:rounded-lg animate-pulse"
              >
                <div className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="px-3 pb-3 space-y-2">
                  <div className="h-3.5 w-full bg-gray-100 rounded" />
                  <div className="h-3.5 w-4/5 bg-gray-100 rounded" />
                  <div className="h-3.5 w-3/5 bg-gray-100 rounded" />
                </div>
                <div className="px-3 pb-3 flex gap-3">
                  <div className="h-6 w-6 bg-gray-100 rounded" />
                  <div className="h-6 w-6 bg-gray-100 rounded" />
                </div>
              </div>
            ))
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => {
              const prevPost = index > 0 ? filteredPosts[index - 1] : null;
              const showDateSeparator =
                prevPost && !isSameDayCheck(post.timestamp, prevPost.timestamp);

              return (
                <div key={post.id} className="flex flex-col">
                  {showDateSeparator && (
                    <motion.div
                      {...feedItemTransition(0)}
                      className="flex items-center gap-4 py-6 px-4 md:px-0"
                    >
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        {formatDate(post.timestamp, "yyyy년 M월 d일")}
                      </span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </motion.div>
                  )}
                  <motion.div {...feedItemTransition(index)}>
                    <FeedItem post={post} currentUserId={userId} />
                  </motion.div>
                </div>
              );
            })
          ) : (
            <motion.div
              {...feedItemTransition(0)}
              className="py-10 text-center text-gray-400"
            >
              등록된 묵상이 없습니다.
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { formatDate, isSameDayCheck } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DailyWordCard from "./components/DailyWordCard";
import FeedItem from "./components/FeedItem";
import { MobileHeader } from "./components/MobileHeader";
import { FeedFilter, Post } from "./types";

interface QtAnswerRow {
  id: string;
  meditation: string;
  created_at: string;
  is_public: boolean;
  user_id: string;
  answer_type: string;
  user: {
    id: string;
    user_name: string;
    guk_no: number;
    avatar_url?: string;
    enneagram_type?: string;
  } | null;
  daily_qt: {
    bible_book: string;
    chapter: number;
    verse_from: number;
    verse_to: number;
    content: string;
  };
  likes: {
    user_id: string;
    user: { user_name: string; avatar_url?: string };
  }[];
  comments: { count: number }[];
  liked_by_me: { user_id: string }[];
}

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

export default function HomePage() {
  const [filter, setFilter] = useState<FeedFilter>(FeedFilter.ALL);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEnneagram, setCurrentUserEnneagram] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data, error } = await supabase
        .from("oq_user_qt_answers")
        .select(
          `
          id,
          meditation,
          created_at,
          is_public,
          user_id,
          answer_type,
          user:oq_users!user_id (
            id, user_name, guk_no, avatar_url, enneagram_type
          ),
          daily_qt:oq_daily_qt (
            bible_book, chapter, verse_from, verse_to, content
          ),
          likes:oq_qt_likes(
            user_id,
            user:oq_users!user_id(user_name, avatar_url)
          ),
          comments:oq_qt_comments(count),
          liked_by_me:oq_qt_likes(user_id)
        `,
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      // Fetch current user's enneagram type
      if (user) {
        const { data: userData } = await supabase
          .from("oq_users")
          .select("enneagram_type")
          .eq("id", user.id)
          .single();
        if (userData) {
          setCurrentUserEnneagram(userData.enneagram_type);
        }
      }

      // Fetch users who have had any activity today (KST)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { data: activeUsersToday } = await supabase
        .from("oq_user_qt_answers")
        .select("user_id, created_at") // Select created_at to check for today's activity
        .gte("created_at", startOfToday.toISOString());

      const activeUserIds = new Set(
        activeUsersToday?.map((item) => item.user_id) || [],
      );

      if (error) {
        console.error("Error fetching posts:", error);
      }

      if (data) {
        // Transform DB data to Post type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedPosts: Post[] = (data as any[]).map(
          (item: QtAnswerRow) => ({
            id: item.id,
            user: {
              id: item.user_id,
              name: item.user?.user_name || "알 수 없음",
              avatar:
                item.user?.avatar_url ||
                `https://picsum.photos/seed/${item.user_id}/100/100`,
              type: "Anytime",
              streak: 0,
              group: item.user ? `${item.user.guk_no}국` : "미지정",
              level: 1,
              currentExp: 0,
              maxExp: 100,
              hasDoneToday: activeUserIds.has(item.user_id),
              enneagramType: item.user?.enneagram_type,
            },
            content: item.meditation,
            scriptureRef: item.daily_qt
              ? `${item.daily_qt.bible_book} ${item.daily_qt.chapter}:${item.daily_qt.verse_from}-${item.daily_qt.verse_to}`
              : "말씀 정보 없음",
            scriptureContent: item.daily_qt?.content,
            scriptureTitle: item.daily_qt
              ? `${item.daily_qt.bible_book} ${item.daily_qt.chapter}장`
              : undefined,
            amenCount: item.likes?.length || 0,
            likedUsers:
              item.likes?.map(
                (l: {
                  user_id: string;
                  user?: { user_name: string; avatar_url?: string };
                }) => ({
                  userId: l.user_id,
                  userName: l.user?.user_name || "알 수 없음",
                  avatarUrl: l.user?.avatar_url,
                }),
              ) || [],
            commentCount: (item.comments && item.comments[0]?.count) || 0,
            isLiked:
              (item.liked_by_me &&
                item.liked_by_me.some(
                  (like: { user_id: string }) => like.user_id === user?.id,
                )) ||
              false,
            timestamp: item.created_at,
            tags: [], // Tags not implemented in DB yet
            isAnonymous: !item.is_public,
            imageUrl: undefined,
          }),
        );
        setPosts(mappedPosts);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (filter === FeedFilter.MY_TYPE) {
      if (!currentUserEnneagram) return true; // Fallback if user info doesn't exist
      return post.user.enneagramType === currentUserEnneagram;
    }
    return true;
  });

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
        <div className="space-y-0 md:space-y-4">
          {loading ? (
            <motion.div
              {...feedItemTransition(0)}
              className="py-10 text-center text-gray-400"
            >
              Loading feeds...
            </motion.div>
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
                    <FeedItem post={post} currentUserId={currentUserId} />
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

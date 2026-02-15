"use client";

import { createClient } from "@/lib/supabase/client";
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
  } | null;
  daily_qt: {
    bible_book: string;
    chapter: number;
    verse_from: number;
    verse_to: number;
  };
  likes: { count: number }[];
  comments: { count: number }[];
  liked_by_me: { user_id: string }[];
}

export default function HomePage() {
  const [filter, setFilter] = useState<FeedFilter>(FeedFilter.ALL);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
            id, user_name, guk_no, avatar_url
          ),
          daily_qt:oq_daily_qt (
            bible_book, chapter, verse_from, verse_to
          ),
          likes:oq_qt_likes(count),
          comments:oq_qt_comments(count),
          liked_by_me:oq_qt_likes(user_id)
        `,
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false });

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
            },
            content: item.meditation,
            scriptureRef: item.daily_qt
              ? `${item.daily_qt.bible_book} ${item.daily_qt.chapter}:${item.daily_qt.verse_from}-${item.daily_qt.verse_to}`
              : "말씀 정보 없음",
            amenCount: (item.likes && item.likes[0]?.count) || 0,
            commentCount: (item.comments && item.comments[0]?.count) || 0,
            isLiked: (item.liked_by_me && item.liked_by_me.length > 0) || false,
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

  const filteredPosts = posts.filter(() => {
    if (filter === FeedFilter.MY_TYPE) return true; // Implement proper filtering later
    return true;
  });

  return (
    <div className="pb-20 md:py-8 px-0">
      <MobileHeader />

      <div className="md:px-4 mt-2 md:mt-0">
        {/* DailyWordCard - Using static/mock data for now, or update it separately */}
        <DailyWordCard />

        <div className="px-4 md:px-0 flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
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
            ☀️ 아침형
          </button>
        </div>

        <div className="space-y-0 md:space-y-6">
          {loading ? (
            <div className="py-10 text-center text-gray-400">
              Loading feeds...
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <FeedItem
                key={post.id}
                post={post}
                currentUserId={currentUserId}
              />
            ))
          ) : (
            <div className="py-10 text-center text-gray-400">
              등록된 묵상이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

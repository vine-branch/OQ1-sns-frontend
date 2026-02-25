"use client";

import {
  ResponsiveModal,
  ResponsiveModalBody,
} from "@/components/ui/responsive-modal";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime, getTodayStr, isFeatureEnabled } from "@/lib/utils";
import { motion } from "framer-motion";
import { Award, Calendar, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BADGES } from "../constants";
import { Badge, Post } from "../types";
import ActivityCalendar from "./ActivityCalendar";
import FeedItem from "./FeedItem";
import UserAvatar from "./UserAvatar";

interface UserProfile {
  id: string;
  user_name: string;
  guk_no: number;
  birth_date: string;
  leader_name: string;
  enneagram_type: string;
  avatar_url?: string;
}

interface QtPost {
  id: string;
  created_at: string;
  meditation: string;
  is_public: boolean;
  oq_daily_qt: {
    qt_date: string;
    bible_book: string;
    chapter: number;
    verse_from: number;
    verse_to: number;
  };
  likes: { count: number }[];
  comments: { count: number }[];
  liked_by_me: { user_id: string }[];
}

interface Reaction {
  id: string;
  type: "like" | "comment";
  user_name: string;
  created_at: string;
}

// ─── Animation Helpers ────────────────────────────────────────────────────
const fadeRise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" as const, delay },
});

const feedItemTransition = (index: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.4,
    ease: "easeOut" as const,
    delay: 0.5 + Math.min(index, 8) * 0.07,
  },
});

interface ProfileViewProps {
  userId: string;
  isOwnProfile?: boolean;
  children?: React.ReactNode;
}

export default function ProfileView({
  userId,
  isOwnProfile = false,
  children,
}: ProfileViewProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activityDates, setActivityDates] = useState<string[]>([]);
  const [hasDoneToday, setHasDoneToday] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  // Badge Modal
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const [stats, setStats] = useState({
    postCount: 0,
    streak: 0,
    maxStreak: 0,
    earlyBirdCount: 0,
    level: 1,
    currentExp: 0,
    maxExp: 100,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      // 1. 프로필 조회
      const { data: userData } = await supabase
        .from("oq_users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userData) {
        setProfile({
          ...userData,
          avatar_url:
            userData.avatar_url ||
            "https://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_640x640.jpg",
        });
      }

      // 2. 큐티 게시글 조회
      let query = supabase
        .from("oq_user_qt_answers")
        .select(
          `
          id,
          created_at,
          meditation,
          is_public,
          oq_daily_qt!inner (
            qt_date,
            bible_book,
            chapter,
            verse_from,
            verse_to
          ),
          likes:oq_qt_likes(count),
          comments:oq_qt_comments(count),
          liked_by_me:oq_qt_likes(user_id)
        `,
          { count: "exact" },
        )
        .eq("user_id", userId);

      if (!isOwnProfile) {
        query = query.eq("is_public", true);
      }

      const { data: rawPostData, count } = await query.order("created_at", {
        ascending: false,
      });

      if (rawPostData) {
        const postData = rawPostData as unknown as QtPost[];

        // 날짜 및 스트릭 계산
        const dates = postData.map((post) => post.oq_daily_qt.qt_date);
        setActivityDates(dates);

        const calculateStreaks = (dateList: string[]) => {
          if (dateList.length === 0) return { current: 0, max: 0 };
          const uniqueDates = Array.from(new Set(dateList)).sort((a, b) =>
            b.localeCompare(a),
          );

          let maxStreak = 1;
          let runningStreak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const currentD = new Date(uniqueDates[i - 1]); // descending, so this is newer
            const prevD = new Date(uniqueDates[i]); // older
            const diffHours =
              (currentD.getTime() - prevD.getTime()) / (1000 * 3600);
            if (diffHours >= 23 && diffHours <= 25) {
              // exactly 1 day diff
              runningStreak++;
              maxStreak = Math.max(maxStreak, runningStreak);
            } else {
              runningStreak = 1;
            }
          }

          const todayStr = getTodayStr();
          const today = new Date(todayStr); // local KST 00:00:00

          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

          const dateSet = new Set(uniqueDates);
          let currentStreak = 0;
          let checkDate = new Date(todayStr);

          if (!dateSet.has(todayStr)) {
            if (!dateSet.has(yesterdayStr)) {
              return { current: 0, max: maxStreak };
            }
            checkDate = new Date(yesterdayStr);
          }

          while (true) {
            const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
            if (dateSet.has(dStr)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }

          return {
            current: Math.max(1, currentStreak),
            max: Math.max(currentStreak, maxStreak),
          };
        };

        const { current: currentStreak, max: maxStreak } =
          calculateStreaks(dates);

        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const doneToday = postData.some(
          (post) => new Date(post.created_at).getTime() >= startOfToday,
        );
        setHasDoneToday(doneToday);

        // Count early birds
        let earlyCount = 0;
        postData.forEach((p) => {
          const d = new Date(p.created_at);
          if (d.getHours() < 6) earlyCount++;
        });

        setStats((prev) => ({
          ...prev,
          postCount: count || 0,
          streak: currentStreak,
          maxStreak: maxStreak,
          earlyBirdCount: earlyCount,
        }));

        const formattedPosts: Post[] = postData.map((post) => ({
          id: post.id,
          user: {
            id: userId,
            name: userData?.user_name || "사용자",
            avatar:
              userData?.avatar_url ||
              "https://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_640x640.jpg",
            type: "Anytime",
            streak: currentStreak,
            group: userData ? `청년 ${userData.guk_no}국` : "청년부",
            level: 1,
            currentExp: 0,
            maxExp: 100,
            hasDoneToday: doneToday,
          },
          timestamp: post.created_at,
          scriptureRef: `${post.oq_daily_qt.bible_book} ${post.oq_daily_qt.chapter}:${post.oq_daily_qt.verse_from}-${post.oq_daily_qt.verse_to}`,
          content: post.meditation,
          amenCount: (post.likes && post.likes[0]?.count) || 0,
          commentCount: (post.comments && post.comments[0]?.count) || 0,
          isLiked: (post.liked_by_me && post.liked_by_me.length > 0) || false,
          isAnonymous: !post.is_public,
          tags: [],
          imageUrl: undefined,
        }));
        setPosts(formattedPosts);

        if (isOwnProfile && postData.length > 0) {
          const postIds = postData.map((p) => p.id);

          const { data: latestLikes } = await supabase
            .from("oq_qt_likes")
            .select("id, created_at, user:oq_users!inner(user_name)")
            .in("answer_id", postIds)
            .neq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(3);

          const { data: latestComments } = await supabase
            .from("oq_qt_comments")
            .select("id, created_at, user:oq_users!inner(user_name)")
            .in("answer_id", postIds)
            .neq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(3);

          const allReactions: Reaction[] = [];
          if (latestLikes) {
            latestLikes.forEach((l) => {
              const u = l.user as unknown as { user_name: string };
              allReactions.push({
                id: l.id,
                type: "like",
                user_name: u?.user_name,
                created_at: l.created_at,
              });
            });
          }
          if (latestComments) {
            latestComments.forEach((c) => {
              const u = c.user as unknown as { user_name: string };
              allReactions.push({
                id: c.id,
                type: "comment",
                user_name: u?.user_name,
                created_at: c.created_at,
              });
            });
          }
          allReactions.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
          setReactions(allReactions.slice(0, 3));
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [userId, isOwnProfile]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-20 w-20 bg-gray-100 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile)
    return (
      <div className="py-20 text-center text-gray-500">
        사용자를 찾을 수 없습니다.
      </div>
    );

  const expPercentage = Math.min((stats.currentExp / stats.maxExp) * 100, 100);

  // Calculate Badges
  const computedBadges: Badge[] = [
    { ...BADGES[0], acquired: stats.maxStreak >= 3 },
    { ...BADGES[1], acquired: stats.maxStreak >= 7 },
    { ...BADGES[2], acquired: stats.earlyBirdCount >= 10 },
    { ...BADGES[3], acquired: stats.postCount >= 100 },
  ];

  return (
    <div className="w-full">
      {/* ── Ambient Floating Particles ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-purple-200/15 blur-3xl"
          style={{ top: "10%", right: "-12%" }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" as const }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full bg-amber-200/15 blur-3xl"
          style={{ bottom: "30%", left: "-10%" }}
          animate={{ y: [0, 12, 0], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay: 2 }}
        />
      </div>

      {/* Header / Profile Section */}
      <motion.div {...fadeRise(0)} className="bg-white p-6 md:rounded-lg md:border border-gray-200 mb-6 relative">
        {/* 데스크톱 상단 메뉴 액션 (Slot) */}
        {children && (
          <div className="absolute top-4 right-4 hidden md:block z-20">
            {children}
          </div>
        )}

        <div className="flex items-center gap-6 md:gap-8">
          <div className="relative shrink-0">
            <UserAvatar
              src={profile.avatar_url}
              alt={profile.user_name}
              size="xl"
              hasDoneToday={hasDoneToday}
            />
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow border border-gray-100">
              <span className="text-lg">☀️</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {profile.user_name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  청년 {profile.guk_no}국 • {profile.enneagram_type || "미설정"}{" "}
                  타입
                </p>
              </div>
            </div>

            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <span className="block font-bold text-gray-900">
                  {stats.streak}
                </span>
                <span className="text-xs text-gray-500">연속일수</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-gray-900">
                  {stats.level}
                </span>
                <span className="text-xs text-gray-500">레벨</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-gray-900">
                  {stats.postCount}
                </span>
                <span className="text-xs text-gray-500">게시물</span>
              </div>
            </div>

            {isOwnProfile ? (
              <Link
                href="/mypage/edit"
                className="block w-full text-center bg-gray-100 text-sm font-semibold py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                프로필 편집
              </Link>
            ) : (
              <button className="block w-full text-center bg-blue-500 text-white text-sm font-semibold py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
                팔로우
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">
            <span>Level Progress</span>
            <span>
              {stats.currentExp} / {stats.maxExp} EXP
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-yellow-400 via-orange-500 to-red-500"
              style={{ width: `${expPercentage}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
        <div className="md:col-span-2 space-y-6">
          <motion.div {...fadeRise(0.15)} className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="text-gray-900" size={18} />
                <h2 className="font-bold text-gray-900 text-sm">뱃지 컬렉션</h2>
              </div>
              <span
                className="text-xs text-blue-500 font-semibold cursor-pointer"
                onClick={() => setShowBadgeModal(true)}
              >
                모두 보기
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {computedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
                  onClick={() => setShowBadgeModal(true)}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border ${badge.acquired ? "bg-gray-50 border-gray-200" : "bg-gray-50 border-gray-100 grayscale opacity-40"}`}
                  >
                    {badge.icon}
                  </div>
                  <span
                    className={`text-[10px] font-medium text-center ${badge.acquired ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>

            <ResponsiveModal
              open={showBadgeModal}
              onOpenChange={setShowBadgeModal}
              title="나의 뱃지 컬렉션"
            >
              <ResponsiveModalBody className="max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  {computedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex gap-4 p-4 border border-gray-100 rounded-xl items-center bg-gray-50/50"
                    >
                      <div
                        className={`w-16 h-16 shrink-0 rounded-full flex items-center justify-center text-3xl border shadow-sm ${badge.acquired ? "bg-white border-gray-200" : "bg-gray-100 border-gray-100 grayscale opacity-40"}`}
                      >
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900">
                          {badge.name}
                        </h3>
                        <p className="text-[12px] text-gray-500 mt-1 leading-snug">
                          {badge.description}
                        </p>
                        <div className="mt-2 flex items-center">
                          {badge.acquired ? (
                            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                              획득 완료
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                              미획득
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ResponsiveModalBody>
            </ResponsiveModal>
          </motion.div>

          <motion.div {...fadeRise(0.25)} className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-gray-900" size={18} />
              <h2 className="font-bold text-gray-900 text-sm">활동 기록</h2>
            </div>
            <ActivityCalendar
              completedDates={activityDates}
              streak={stats.streak}
            />
          </motion.div>

          <motion.div {...fadeRise(0.35)}>
            <h2 className="font-bold text-gray-900 text-sm mb-4 px-1">
              {isOwnProfile
                ? "내 큐티 묵상"
                : `${profile.user_name}님의 큐티 묵상`}
            </h2>
            <div className="space-y-0">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.div key={post.id} {...feedItemTransition(index)}>
                    <FeedItem
                      post={post}
                      currentUserId={isOwnProfile ? userId : null}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm bg-gray-50 rounded-lg">
                  작성한 묵상이 없습니다.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {isOwnProfile && (
            <>
              {/* Gradient Card: 오늘의 응원 */}
              <motion.div {...fadeRise(0.2)} className="bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 p-6 rounded-lg shadow-md text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-1">오늘의 응원</h3>
                  <p className="text-white/80 text-xs mb-4">
                    지체들의 따뜻한 마음을 확인하세요.
                  </p>

                  {reactions.length > 0 ? (
                    reactions.map((reaction) => (
                      <div
                        key={reaction.id}
                        className="bg-white/10 backdrop-blur-md rounded-lg p-3 mb-2 last:mb-0 flex items-center gap-3 border border-white/10"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm shrink-0">
                          {reaction.type === "like" ? "🙏" : "💬"}
                        </div>
                        <div className="leading-tight">
                          <p className="text-xs font-semibold">
                            {reaction.type === "like"
                              ? `${reaction.user_name}님이 '아멘'을 보냈어요.`
                              : `${reaction.user_name}님이 댓글을 남겼어요.`}
                          </p>
                          <span className="text-[10px] opacity-70 mt-0.5 block">
                            {formatRelativeTime(reaction.created_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex flex-col items-center justify-center text-center border border-white/10">
                      <span className="text-2xl mb-2">🌱</span>
                      <p className="text-sm font-semibold">
                        아직 받은 반응이 없습니다.
                      </p>
                      <p className="text-[10px] text-white/80 mt-1">
                        지체들과 말씀을 나누고 교제해 보세요!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 청년부 현황 */}
              {isFeatureEnabled("photoUpload") && (
                <div className="bg-white p-5 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="text-gray-900" size={18} />
                    <h2 className="font-bold text-gray-900 text-sm">
                      청년부 현황
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">진행률</span>
                      <span className="font-bold text-blue-500">82%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: "82%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">
                      42명 완료
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 소속 정보 (상시 노출) */}
          <motion.div {...fadeRise(0.3)} className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="text-gray-900" size={18} />
              <h2 className="font-bold text-gray-900 text-sm">소속 정보</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">소속</span>
                <span className="font-bold text-gray-900">
                  청년 {profile.guk_no}국
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">리더</span>
                <span className="font-bold text-gray-900">
                  {profile.leader_name} 리더
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

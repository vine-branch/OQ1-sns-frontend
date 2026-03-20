"use client";

import {
  ResponsiveModal,
  ResponsiveModalBody,
} from "@/components/ui/responsive-modal";
import {
  formatDateToStr,
  formatRelativeTime,
  getDiffHours,
  getNow,
  isFeatureEnabled,
  parseDate,
  subtractDays,
} from "@/lib/utils";
import { motion } from "framer-motion";
import { Award, Calendar, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BADGES } from "../constants";
import { useRecentReactions, useUserPosts, useUserProfile } from "../hooks/useQueries";
import { Badge, Post } from "../types";
import ActivityCalendar from "./ActivityCalendar";
import FeedItem from "./FeedItem";
import UserAvatar from "./UserAvatar";
import UserBadges from "./UserBadges";

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
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // React Query: 프로필 + 게시글 병렬 fetch
  const { data: profile, isLoading: profileLoading } = useUserProfile(userId);
  const { data: rawPosts, isLoading: postsLoading } = useUserPosts(userId, isOwnProfile);
  const loading = profileLoading || postsLoading;

  // 파생 상태: 한 번의 순회로 모든 통계 계산
  const { activityDates, hasDoneToday, stats, posts } = useMemo(() => {
    if (!rawPosts || rawPosts.length === 0) {
      return {
        activityDates: [] as string[],
        hasDoneToday: false,
        stats: { postCount: 0, streak: 0, maxStreak: 0, earlyBirdCount: 0, preferredType: "Morning" as const },
        posts: [] as Post[],
      };
    }

    const dates: string[] = [];
    let earlyCount = 0;
    let dayCount = 0;
    let nightCount = 0;
    let doneToday = false;

    // 단일 순회로 dates, 시간대 통계, hasDoneToday 계산
    for (const post of rawPosts) {
      dates.push(post.timestamp.split("T")[0]);
      const hour = parseDate(post.timestamp).getHours();
      if (hour < 6) earlyCount++;
      if (hour >= 6 && hour < 18) dayCount++;
      else nightCount++;
      if (post.user.hasDoneToday) doneToday = true;
    }

    const preferredType = nightCount > dayCount ? "Night" : "Morning";

    // 스트릭 계산
    const calculateStreaks = (dateList: string[]) => {
      if (dateList.length === 0) return { current: 0, max: 0 };
      const uniqueDates = Array.from(new Set(dateList)).sort((a, b) => b.localeCompare(a));
      const isSunday = (d: Date) => d.getDay() === 0;

      const isAdjacentDate = (newer: string, older: string) => {
        const newerD = parseDate(newer);
        const olderD = parseDate(older);
        const diffHours = getDiffHours(newerD, olderD);
        if (diffHours >= 23 && diffHours <= 25) return true;
        if (diffHours >= 47 && diffHours <= 49) {
          if (isSunday(subtractDays(newerD, 1))) return true;
        }
        return false;
      };

      let maxStreak = 1;
      let runningStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        if (isAdjacentDate(uniqueDates[i - 1], uniqueDates[i])) {
          runningStreak++;
          maxStreak = Math.max(maxStreak, runningStreak);
        } else {
          runningStreak = 1;
        }
      }

      const dateSet = new Set(uniqueDates);
      let currentStreak = 0;
      let checkDate = getNow();

      if (!dateSet.has(formatDateToStr(checkDate))) {
        checkDate = subtractDays(checkDate, 1);
        if (isSunday(checkDate)) checkDate = subtractDays(checkDate, 1);
        if (!dateSet.has(formatDateToStr(checkDate))) return { current: 0, max: maxStreak };
      }

      while (true) {
        const dStr = formatDateToStr(checkDate);
        if (isSunday(checkDate)) {
          if (dateSet.has(dStr)) currentStreak++;
          checkDate = subtractDays(checkDate, 1);
          continue;
        }
        if (dateSet.has(dStr)) {
          currentStreak++;
          checkDate = subtractDays(checkDate, 1);
        } else {
          break;
        }
      }

      return { current: Math.max(1, currentStreak), max: Math.max(currentStreak, maxStreak) };
    };

    const { current: currentStreak, max: maxStreak } = calculateStreaks(dates);

    const postsWithProfile = rawPosts.map((post) => ({
      ...post,
      user: {
        ...post.user,
        name: profile?.user_name || "사용자",
        avatar: profile?.avatar_url || post.user.avatar,
        type: preferredType as "Morning" | "Night" | "Lunch" | "Anytime",
        streak: currentStreak,
      },
    })) as Post[];

    return {
      activityDates: dates,
      hasDoneToday: doneToday,
      stats: {
        postCount: rawPosts.length,
        streak: currentStreak,
        maxStreak,
        earlyBirdCount: earlyCount,
        preferredType: preferredType as "Morning" | "Night",
      },
      posts: postsWithProfile,
    };
  }, [rawPosts, profile]);

  // 반응 데이터: 게시글 로드 후 조건부 fetch
  const postIds = useMemo(() => posts.map((p) => p.id), [posts]);
  const { data: reactions = [] } = useRecentReactions(
    userId,
    postIds,
    isOwnProfile && posts.length > 0,
  );

  if (loading) {
    return (
      <div className="w-full animate-pulse">
        <div className="bg-white p-6 md:rounded-lg md:border border-gray-200 mb-6">
          <div className="flex items-center gap-6 md:gap-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-24 bg-gray-100 rounded" />
              <div className="h-3 w-36 bg-gray-100 rounded" />
              <div className="flex gap-6">
                <div className="h-8 w-12 bg-gray-100 rounded" />
                <div className="h-8 w-12 bg-gray-100 rounded" />
                <div className="h-8 w-12 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200 h-32" />
            <div className="bg-white p-5 rounded-lg border border-gray-200 h-40" />
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 h-48" />
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

  const computedBadges: Badge[] = [
    { ...BADGES[0], acquired: stats.maxStreak >= 3 },
    { ...BADGES[1], acquired: stats.maxStreak >= 7 },
    { ...BADGES[2], acquired: stats.earlyBirdCount >= 10 },
    { ...BADGES[3], acquired: stats.postCount >= 100 },
  ];

  return (
    <div className="w-full">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-purple-200/15 blur-3xl"
          style={{ top: "10%", right: "-12%" }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.35, 0.2] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full bg-amber-200/15 blur-3xl"
          style={{ bottom: "30%", left: "-10%" }}
          animate={{ y: [0, 12, 0], opacity: [0.15, 0.28, 0.15] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: 2,
          }}
        />
      </div>

      <motion.div
        {...fadeRise(0)}
        className="bg-white p-6 md:rounded-lg md:border border-gray-200 mb-6 relative"
      >
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
              <span className="text-lg">
                {stats.preferredType === "Night" ? "🌛" : "☀️"}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {profile.user_name}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm text-gray-500">
                    청년 {profile.guk_no}국
                  </span>
                  <UserBadges
                    enneagramType={profile.enneagram_type}
                    badges={computedBadges.filter((b) => b.acquired).map((b) => b.icon)}
                    showFullType
                  />
                </div>
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
                  {computedBadges.filter((b) => b.acquired).length}
                </span>
                <span className="text-xs text-gray-500">뱃지</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-gray-900">
                  {stats.postCount}
                </span>
                <span className="text-xs text-gray-500">게시물</span>
              </div>
            </div>

            {isOwnProfile && (
              <Link
                href="/mypage/edit"
                className="block w-full text-center bg-gray-100 text-sm font-semibold py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                프로필 편집
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
        <div className="md:col-span-2 space-y-6">
          <motion.div
            {...fadeRise(0.15)}
            className="bg-white p-5 rounded-lg border border-gray-200"
          >
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

          <motion.div
            {...fadeRise(0.25)}
            className="bg-white p-5 rounded-lg border border-gray-200"
          >
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
            <div className="space-y-4">
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
              <motion.div
                {...fadeRise(0.2)}
                className="bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 p-6 rounded-lg shadow-md text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-1">공동체의 응원</h3>
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

          <motion.div
            {...fadeRise(0.3)}
            className="bg-white p-5 rounded-lg border border-gray-200"
          >
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

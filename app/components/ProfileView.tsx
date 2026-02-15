"use client";

import { createClient } from "@/lib/supabase/client";
import { Award, Calendar, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BADGES } from "../constants";
import { Post } from "../types";
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
  const [stats, setStats] = useState({
    postCount: 0,
    streak: 0,
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

      // 본인 프로필이 아니면 공개글만 조회
      if (!isOwnProfile) {
        query = query.eq("is_public", true);
      }

      const { data: rawPostData, count } = await query.order("created_at", {
        ascending: false,
      });

      if (rawPostData) {
        const postData = rawPostData as unknown as QtPost[];

        // 활동 날짜 추출
        const dates = postData.map((post) => post.oq_daily_qt.qt_date);
        setActivityDates(dates);

        // 스트릭 계산
        const calculateStreak = (dateList: string[]) => {
          const uniqueDates = Array.from(new Set(dateList)).sort((a, b) =>
            b.localeCompare(a),
          );
          if (uniqueDates.length === 0) return 0;

          const today = new Date();
          const todayStr = today.toISOString().split("T")[0];
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          const dateSet = new Set(uniqueDates);
          let streak = 0;
          let checkDate = new Date(today);

          if (!dateSet.has(todayStr)) {
            if (!dateSet.has(yesterdayStr)) return 0;
            checkDate = new Date(yesterday);
          }

          while (true) {
            const dateStr = checkDate.toISOString().split("T")[0];
            if (dateSet.has(dateStr)) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
          return streak;
        };

        const currentStreak = calculateStreak(dates);

        // 오늘 인증 여부
        const now = new Date();
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        ).getTime();
        const doneToday = postData.some(
          (post) => new Date(post.created_at).getTime() >= startOfToday,
        );
        setHasDoneToday(doneToday);

        setStats((prev) => ({
          ...prev,
          postCount: count || 0,
          streak: currentStreak,
        }));

        // FeedItem 형식 변환
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

  return (
    <div className="w-full">
      {/* Header / Profile Section */}
      <div className="bg-white p-6 md:rounded-lg md:border border-gray-200 mb-6 relative">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="text-gray-900" size={18} />
                <h2 className="font-bold text-gray-900 text-sm">뱃지 컬렉션</h2>
              </div>
              <span className="text-xs text-blue-500 font-semibold cursor-pointer">
                모두 보기
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {BADGES.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-2"
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
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-gray-900" size={18} />
              <h2 className="font-bold text-gray-900 text-sm">활동 기록</h2>
            </div>
            <ActivityCalendar
              completedDates={activityDates}
              streak={stats.streak}
            />
          </div>

          <div>
            <h2 className="font-bold text-gray-900 text-sm mb-4 px-1">
              {isOwnProfile
                ? "내 큐티 묵상"
                : `${profile.user_name}님의 큐티 묵상`}
            </h2>
            <div className="space-y-0">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <FeedItem
                    key={post.id}
                    post={post}
                    currentUserId={isOwnProfile ? userId : null}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm bg-gray-50 rounded-lg">
                  작성한 묵상이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isOwnProfile && (
            <>
              {/* Gradient Card: 오늘의 응원 */}
              <div className="bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 p-6 rounded-lg shadow-md text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-1">오늘의 응원</h3>
                  <p className="text-white/80 text-xs mb-4">
                    지체들의 따뜻한 마음을 확인하세요.
                  </p>

                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 mb-2 flex items-center gap-3 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                      🙏
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{`이믿음님이 '아멘'을 보냈어요.`}</p>
                      <span className="text-[10px] opacity-70">10분 전</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex items-center gap-3 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                      💬
                    </div>
                    <div>
                      <p className="text-xs font-semibold">
                        박사랑님이 댓글을 남겼어요.
                      </p>
                      <span className="text-[10px] opacity-70">1시간 전</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 청년부 현황 */}
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
            </>
          )}

          {/* 소속 정보 (상시 노출) */}
          <div className="bg-white p-5 rounded-lg border border-gray-200">
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
          </div>
        </div>
      </div>
    </div>
  );
}

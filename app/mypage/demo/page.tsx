"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Award,
  Calendar,
  LogOut,
  Menu,
  MessageSquare,
  PlusSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ActivityCalendar from "../../components/ActivityCalendar";
import FeedItem from "../../components/FeedItem";
import { MobileHeader } from "../../components/MobileHeader";
import UserAvatar from "../../components/UserAvatar";
import { BADGES, CURRENT_USER, MOCK_MY_POSTS } from "../../constants";

function ProfileMenu() {
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠어요?")) return;
    router.push("/login");
    router.refresh();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-2 -m-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
          aria-label="메뉴 열기"
        >
          <Menu size={24} strokeWidth={1.5} className="text-gray-700" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 p-0 rounded-xl"
      >
        <div className="py-1">
          <Link
            href="/mypage/edit"
            className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            프로필 편집
          </Link>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut size={16} strokeWidth={2} />
            로그아웃
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function MyPage() {
  const expPercentage = Math.min(
    (CURRENT_USER.currentExp / CURRENT_USER.maxExp) * 100,
    100,
  );

  return (
    <div className="pb-20 md:py-8">
      {/* Mobile Header - 공통 컴포넌트 사용 */}
      <MobileHeader
        rightContent={
          <div className="flex gap-2">
            <PlusSquare size={24} strokeWidth={1.5} />
            <ProfileMenu />
          </div>
        }
      />

      {/* Header / Profile Section */}
      <div className="bg-white p-6 md:rounded-lg md:border border-gray-200 mb-6 relative mt-2 md:mt-0">
        {/* 데스크톱: 프로필 카드 우측 상단 메뉴 (인스타그램처럼) */}
        <div className="absolute top-4 right-4 hidden md:block">
          <ProfileMenu />
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          {/* Avatar with UserAvatar Component */}
          <div className="relative shrink-0">
            <UserAvatar
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              size="xl"
              hasDoneToday={true} // 데모에서는 오늘 완료한 것으로 표시
            />
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow border border-gray-100">
              <span className="text-lg">☀️</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {CURRENT_USER.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {CURRENT_USER.group} • {CURRENT_USER.type} 타입
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <span className="block font-bold text-gray-900">
                  {CURRENT_USER.streak}
                </span>
                <span className="text-xs text-gray-500">연속일수</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-gray-900">
                  {CURRENT_USER.level}
                </span>
                <span className="text-xs text-gray-500">레벨</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-gray-900">142</span>
                <span className="text-xs text-gray-500">게시물</span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button className="w-full bg-gray-100 text-sm font-semibold py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
              프로필 편집
            </button>
          </div>
        </div>

        {/* EXP Bar - Minimal */}
        <div className="mt-6">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">
            <span>Level Progress</span>
            <span>
              {CURRENT_USER.currentExp} / {CURRENT_USER.maxExp} EXP
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
        {/* Left Column: 뱃지 → 내 활동 기록 → 내 큐티 묵상 피드 */}
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
              <h2 className="font-bold text-gray-900 text-sm">내 활동 기록</h2>
            </div>
            <ActivityCalendar />
          </div>

          {/* 내 큐티 묵상 - 홈과 같은 카드로 아래로 쭉 */}
          <div>
            <h2 className="font-bold text-gray-900 text-sm mb-4 px-1">
              내 큐티 묵상
            </h2>
            <div className="space-y-0">
              {MOCK_MY_POSTS.map((post) => (
                <FeedItem key={post.id} post={post} currentUserId={null} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Gradient Card */}
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

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="text-gray-900" size={18} />
              <h2 className="font-bold text-gray-900 text-sm">청년 1부 현황</h2>
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
              <p className="text-xs text-gray-400 text-right mt-1">42명 완료</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

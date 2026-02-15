"use client";

import { useState } from "react";
import DailyWordCard from "./components/DailyWordCard";
import FeedItem from "./components/FeedItem";
import { MobileHeader } from "./components/MobileHeader";
import { MOCK_POSTS } from "./constants";
import { FeedFilter } from "./types";

export default function HomePage() {
  const [filter, setFilter] = useState<FeedFilter>(FeedFilter.ALL);

  // Simple filter logic simulation
  const filteredPosts = MOCK_POSTS.filter((post) => {
    if (filter === FeedFilter.MY_TYPE) return post.user.type === "Morning";
    return true;
  });

  return (
    <div className="pb-20 md:py-8 px-0">
      {/* Mobile Header (Instagram Style) */}
      <MobileHeader />

      <div className="md:px-4 mt-2 md:mt-0">
        <DailyWordCard />

        {/* Filter Tabs - Pill Styles */}
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
          <button
            onClick={() => setFilter(FeedFilter.FOLLOWING)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${filter === FeedFilter.FOLLOWING ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}`}
          >
            찜한 지체
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-0 md:space-y-6">
          {filteredPosts.map((post) => (
            <FeedItem key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

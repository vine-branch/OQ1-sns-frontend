import React, { useState } from 'react';
import { PlusSquare, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import DailyWordCard from '../components/DailyWordCard';
import FeedItem from '../components/FeedItem';
import { MOCK_POSTS } from '../constants';
import { FeedFilter } from '../types';

const HomePage = () => {
  const [filter, setFilter] = useState<FeedFilter>(FeedFilter.ALL);

  // Simple filter logic simulation
  const filteredPosts = MOCK_POSTS.filter(post => {
    if (filter === FeedFilter.MY_TYPE) return post.user.type === 'Morning'; 
    return true; 
  });

  return (
    <div className="pb-20 md:py-8 px-0">
      {/* Mobile Header (Instagram Style) */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex justify-between items-center">
        <h1 className="text-xl font-bold italic font-serif tracking-tight">OQ1</h1>
        <div className="flex items-center gap-4">
             <div className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600">D-12</div>
             <Link to="/upload">
                <PlusSquare size={24} className="text-black" strokeWidth={1.5} />
             </Link>
             <Heart size={24} className="text-black" strokeWidth={1.5} />
        </div>
      </div>

      <div className="md:px-4 mt-2 md:mt-0">
        <DailyWordCard />

        {/* Filter Tabs - Pill Styles */}
        <div className="px-4 md:px-0 flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
            <button 
                onClick={() => setFilter(FeedFilter.ALL)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${filter === FeedFilter.ALL ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
            >
                전체 보기
            </button>
            <button 
                onClick={() => setFilter(FeedFilter.MY_TYPE)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${filter === FeedFilter.MY_TYPE ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
            >
                ☀️ 아침형
            </button>
            <button 
                onClick={() => setFilter(FeedFilter.FOLLOWING)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${filter === FeedFilter.FOLLOWING ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
            >
                찜한 지체
            </button>
        </div>

        {/* Feed */}
        <div className="space-y-0 md:space-y-6">
            {filteredPosts.map(post => (
                <FeedItem key={post.id} post={post} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
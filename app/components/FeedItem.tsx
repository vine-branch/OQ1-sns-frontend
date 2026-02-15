'use client';

import Image from 'next/image';
import { Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import React, { useState } from 'react';
import { Post } from '../types';

interface FeedItemProps {
  post: Post;
}

const FeedItem: React.FC<FeedItemProps> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.amenCount);

  const handleLike = () => {
    if (liked) {
      setCount(c => c - 1);
    } else {
      setCount(c => c + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="bg-white border-b border-gray-200 md:border md:rounded-lg md:mb-6">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {post.isAnonymous ? (
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-white">
                <span className="text-[10px] font-bold">익명</span>
             </div>
          ) : (
             <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
               <Image src={post.user.avatar} alt={post.user.name} width={32} height={32} className="rounded-full border-2 border-white object-cover" unoptimized />
             </div>
          )}
          
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-gray-900">
                {post.isAnonymous ? '익명의 지체' : post.user.name}
              </span>
              <span className="text-gray-400 text-[10px]">• {post.timestamp}</span>
            </div>
            {!post.isAnonymous && (
                <p className="text-xs text-gray-500">{post.user.group}</p>
            )}
          </div>
        </div>
        <button className="text-gray-500 hover:text-black">
            <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Image Attachment */}
      {post.imageUrl && (
        <div className="w-full bg-gray-100 relative aspect-video">
          <Image src={post.imageUrl} alt="QT Note" fill className="object-cover" unoptimized />
        </div>
      )}

      <div className="px-3 py-3">
        {/* Content */}
        <div className="mb-2">
            <span className="font-semibold text-sm mr-2">{post.isAnonymous ? '익명' : post.user.name}</span>
            <span className="text-sm text-gray-800 whitespace-pre-wrap">{post.content}</span>
        </div>
        
        {/* Scripture Reference Badge (styled as tag) */}
        <div className="mb-2">
            <span className="text-xs font-medium text-gray-500 mr-2">📖 {post.scriptureRef}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.map(tag => (
                <span key={tag} className="text-sm text-[#00376b] cursor-pointer hover:underline">{tag}</span>
            ))}
        </div>

        {/* Action Bar - 태그 밑 */}
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleLike}
                    className={`transition-transform active:scale-90 ${liked ? 'text-red-500' : 'text-black hover:text-gray-600'}`}
                >
                    <Heart size={26} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 1.5} />
                </button>
                <button className="text-black hover:text-gray-600">
                    <MessageCircle size={26} strokeWidth={1.5} />
                </button>
                <button className="text-black hover:text-gray-600">
                    <Send size={26} strokeWidth={1.5} />
                </button>
            </div>
        </div>

        {/* Likes Count - 태그 밑 */}
        <div className="mb-2">
            <span className="text-sm font-semibold text-gray-900">아멘 {count}개</span>
        </div>
        
        {post.commentCount > 0 && (
            <button className="text-sm text-gray-500 mt-2">댓글 {post.commentCount}개 모두 보기</button>
        )}
      </div>
    </div>
  );
};

export default FeedItem;
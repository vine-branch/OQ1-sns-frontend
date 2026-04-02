"use client";

import {
  ResponsiveModal,
  ResponsiveModalBody,
} from "@/components/ui/responsive-modal";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Post } from "../types";
import { useAlert } from "./AlertProvider";
import UserAvatar from "./UserAvatar";
import FeedItemComments from "./feed/FeedItemComments";
import FeedItemContent from "./feed/FeedItemContent";
import FeedItemHeader from "./feed/FeedItemHeader";

interface FeedItemProps {
  post: Post;
  currentUserId: string | null;
}

const FeedItem: React.FC<FeedItemProps> = ({ post, currentUserId }) => {
  const [liked, setLiked] = useState(post.isLiked);
  const [count, setCount] = useState(post.amenCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const [showScripture, setShowScripture] = useState(false);
  const showAlert = useAlert();

  const handleLike = async () => {
    if (!currentUserId) {
      showAlert("로그인이 필요합니다.");
      return;
    }

    const supabase = createClient();
    const prevLiked = liked;

    // Optimistic Update
    setLiked(!prevLiked);
    setCount((c) => (prevLiked ? c - 1 : c + 1));

    if (!prevLiked) {
      const { error } = await supabase.from("oq_qt_likes").insert({
        user_id: currentUserId,
        answer_id: post.id,
      });
      if (error) {
        setLiked(false);
        setCount((c) => c - 1);
      }
    } else {
      const { error } = await supabase
        .from("oq_qt_likes")
        .delete()
        .eq("user_id", currentUserId)
        .eq("answer_id", post.id);
      if (error) {
        setLiked(true);
        setCount((c) => c + 1);
      }
    }
  };

  if (isDeleted) return null;

  return (
    <div className="bg-white border-b border-gray-200 md:border md:rounded-lg">
      <FeedItemHeader
        post={post}
        currentUserId={currentUserId}
        onDeleted={() => setIsDeleted(true)}
      />

      {/* Image Attachment */}
      {post.imageUrl && (
        <div className="w-full bg-gray-100 relative aspect-video">
          <Image
            src={post.imageUrl}
            alt="QT Note"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="px-3 py-2">
        <FeedItemContent
          content={post.content}
          tags={post.tags}
          scriptureRef={post.scriptureRef}
          timestamp={post.timestamp}
          formatRelativeTime={formatRelativeTime}
          onScriptureClick={() => setShowScripture(true)}
        />

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-2 pt-1 border-t border-gray-50">
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleLike}
              className={`transition-transform active:scale-90 ${liked ? "text-red-500" : "text-black hover:text-gray-600"}`}
            >
              <Heart
                size={24}
                fill={liked ? "currentColor" : "none"}
                strokeWidth={liked ? 0 : 2}
              />
            </button>
            <button
              className="text-black hover:text-gray-600"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Likes Count */}
        <div className="mb-2">
          {count > 0 && (
            <button
              className="text-[13px] font-bold text-gray-900 text-left"
              onClick={() => setShowLikers(true)}
            >
              {(() => {
                const others = liked
                  ? (post.likedUsers || []).filter(
                      (u) => u.userId !== currentUserId,
                    )
                  : post.likedUsers || [];
                if (liked) {
                  if (count === 1) return "내가 아멘했습니다";
                  if (count === 2)
                    return others[0]
                      ? `${others[0].userName}님과 내가 아멘했습니다`
                      : `나 외 1명이 아멘했습니다`;
                  return others[0]
                    ? `${others[0].userName}님 외 ${count - 2}명과 내가 아멘했습니다`
                    : `나 외 ${count - 1}명이 아멘했습니다`;
                } else {
                  if (!others[0]) return `아멘 ${count}개`;
                  if (count === 1)
                    return `${others[0].userName}님이 아멘했습니다`;
                  if (count === 2)
                    return others[1]
                      ? `${others[0].userName}님과 ${others[1].userName}님이 아멘했습니다`
                      : `${others[0].userName}님 외 1명이 아멘했습니다`;
                  return `${others[0].userName}님 외 ${count - 1}명이 아멘했습니다`;
                }
              })()}
            </button>
          )}
        </div>

        {/* Likers Modal */}
        <ResponsiveModal
          open={showLikers}
          onOpenChange={setShowLikers}
          title="아멘한 사람"
        >
          <ResponsiveModalBody className="space-y-3">
            {post.likedUsers && post.likedUsers.length > 0 ? (
              post.likedUsers.map((u) => (
                <Link
                  key={u.userId}
                  href={`/profile/${u.userId}`}
                  className="flex items-center gap-3"
                  onClick={() => setShowLikers(false)}
                >
                  <UserAvatar src={u.avatarUrl} alt={u.userName} size="sm" />
                  <span className="text-[13px] font-semibold text-gray-900">
                    {u.userName}
                    {u.userId === currentUserId && (
                      <span className="text-gray-400 font-normal ml-1">
                        (나)
                      </span>
                    )}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-center text-[13px] text-gray-400 py-4">
                아직 아무도 아멘하지 않았습니다.
              </p>
            )}
          </ResponsiveModalBody>
        </ResponsiveModal>

        {/* Comment Toggle */}
        <div className="flex items-center gap-2 mt-0.5">
          {commentCount > 0 && !showComments && (
            <button
              className="text-[13px] text-gray-500 font-medium"
              onClick={() => setShowComments(true)}
            >
              댓글 {commentCount}개 모두 보기
            </button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <FeedItemComments
            postId={post.id}
            currentUserId={currentUserId}
            onCommentCountChange={(delta) => setCommentCount((c) => c + delta)}
          />
        )}

        {/* Scripture Detail Modal */}
        <ResponsiveModal
          open={showScripture}
          onOpenChange={setShowScripture}
          title={post.scriptureTitle || "오늘의 말씀"}
        >
          <ResponsiveModalBody className="px-6 py-6">
            <div className="flex flex-col items-start">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">📖</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-left">
                {post.scriptureRef}
              </h3>
              <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[13px] md:text-sm font-medium text-left">
                  {post.scriptureContent || "말씀 내용을 불러올 수 없습니다."}
                </p>
              </div>
            </div>
          </ResponsiveModalBody>
        </ResponsiveModal>
      </div>
    </div>
  );
};

export default FeedItem;

"use client";

import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime, sanitizeText } from "@/lib/utils";
import { ResponsiveModal, ResponsiveModalBody } from "@/components/ui/responsive-modal";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Heart, Lock, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Post } from "../types";
import UserAvatar from "./UserAvatar";

interface FeedItemProps {
  post: Post;
  currentUserId: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    user_name: string;
    avatar_url: string | null;
    hasDoneToday?: boolean;
  } | null;
}

const FeedItem: React.FC<FeedItemProps> = ({ post, currentUserId }) => {
  const [liked, setLiked] = useState(post.isLiked);
  const [count, setCount] = useState(post.amenCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const router = useRouter();

  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (contentRef.current.scrollHeight > 60 || post.content.length > 200) {
        const timer = setTimeout(() => setShowMoreButton(true), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [post.content]);

  const displayName = post.isAnonymous ? "익명의 지체" : post.user.name;

  const handleLike = async () => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const supabase = createClient();
    const prevLiked = liked;

    // 1. UI Optimistic Update
    setLiked(!prevLiked);
    setCount((c) => (prevLiked ? c - 1 : c + 1));

    // 2. Server Sync
    if (!prevLiked) {
      // Logic: Like (Insert)
      const { error } = await supabase.from("oq_qt_likes").insert({
        user_id: currentUserId,
        answer_id: post.id,
      });

      if (error) {
        console.error("Like Error:", error);
        // Rollback on failure
        setLiked(false);
        setCount((c) => c - 1);
      }
    } else {
      // Logic: Unlike (Delete)
      const { error } = await supabase
        .from("oq_qt_likes")
        .delete()
        .eq("user_id", currentUserId)
        .eq("answer_id", post.id);

      if (error) {
        console.error("Unlike Error:", error);
        // Rollback on failure
        setLiked(true);
        setCount((c) => c + 1);
      }
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("oq_qt_comments")
        .select(
          `
          id, content, created_at, user_id,
          user:oq_users!user_id (user_name, avatar_url)
        `,
        )
        .eq("answer_id", post.id)
        .order("created_at", { ascending: true });

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setComments(data as any as Comment[]);
      }
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUserId) return;

    const supabase = createClient();
    const cleanComment = sanitizeText(commentText);

    if (cleanComment.length > 1000) {
      alert("댓글은 1,000자 이내로 작성해 주세요.");
      return;
    }

    if (!cleanComment) return;

    const { data, error } = await supabase
      .from("oq_qt_comments")
      .insert({
        answer_id: post.id,
        user_id: currentUserId,
        content: cleanComment,
      })
      .select(
        `
          id, content, created_at, user_id,
          user:oq_users!user_id (user_name, avatar_url)
      `,
      )
      .single();

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setComments([...comments, data as any as Comment]);
      setCommentCount((c) => c + 1);
      setCommentText("");
    } else if (error) {
      console.error(error);
      alert("댓글 작성 실패");
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 md:border md:rounded-lg md:mb-6">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {post.isAnonymous ? (
            <UserAvatar
              src={post.user.avatar}
              alt={post.user.name}
              size="sm"
              hasDoneToday={post.user.hasDoneToday}
              isAnonymous={true}
            />
          ) : (
            <Link href={`/profile/${post.user.id}`}>
              <UserAvatar
                src={post.user.avatar}
                alt={post.user.name}
                size="sm"
                hasDoneToday={post.user.hasDoneToday}
                isAnonymous={false}
              />
            </Link>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              {post.isAnonymous ? (
                <span className="font-bold text-[13px] text-gray-900">
                  {displayName}
                </span>
              ) : (
                <Link
                  href={`/profile/${post.user.id}`}
                  className="font-bold text-[13px] text-gray-900 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  {displayName}
                </Link>
              )}
              {!post.isAnonymous && post.user.group && (
                <span className="text-gray-400 text-[10px] font-medium">
                  • {post.user.group}
                </span>
              )}
              {post.isAnonymous && (
                <Lock size={12} className="text-gray-400 ml-0.5" />
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            className="text-gray-500 hover:text-black"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 w-24 py-1 overflow-hidden">
                {currentUserId === post.user.id ? (
                  <>
                    <button
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                      onClick={() => {
                        router.push(`/upload?id=${post.id}`);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-50"
                      onClick={() => {
                        if (confirm("삭제하시겠습니까?"))
                          alert("삭제 기능 준비중");
                      }}
                    >
                      삭제
                    </button>
                  </>
                ) : (
                  <button
                    className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-50"
                    onClick={() => {
                      alert("신고되었습니다.");
                      setShowMenu(false);
                    }}
                  >
                    신고
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

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
        {/* Content (Caption) */}
        <div className="mb-2 leading-snug">
          <AnimatePresence initial={false}>
            <motion.div
              initial={false}
              animate={{
                height: isContentExpanded || !showMoreButton ? "auto" : "3.6em",
              }}
              className="overflow-hidden relative"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <span
                ref={contentRef}
                className="text-[13px] text-gray-900 whitespace-pre-wrap block"
              >
                {post.content}
              </span>
              {showMoreButton && !isContentExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent" />
              )}
            </motion.div>
          </AnimatePresence>
          {showMoreButton && (
            <button
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              className="w-full flex justify-center items-center gap-1 mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isContentExpanded ? (
                <>접기 <ChevronUp size={14} /></>
              ) : (
                <>더 보기 <ChevronDown size={14} /></>
              )}
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[13px] text-[#00376b] cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Scripture Reference */}
        <div className="mb-1">
          <span className="text-[12px] font-medium text-blue-600/80 cursor-pointer">
            📖 {post.scriptureRef}
          </span>
        </div>

        {/* Post Timestamp - New Position */}
        <div className="mb-3 px-0.5">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
            {formatRelativeTime(post.timestamp)}
          </p>
        </div>

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
              onClick={toggleComments}
            >
              <MessageCircle size={24} strokeWidth={2} />
            </button>
            <button className="text-black hover:text-gray-600">
              <Send size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Likes Count Row */}
        <div className="mb-2">
          {count > 0 && (
            <button
              className="text-[13px] font-bold text-gray-900 text-left"
              onClick={() => setShowLikers(true)}
            >
              {(() => {
                const others = liked
                  ? (post.likedUsers || []).filter((u) => u.userId !== currentUserId)
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
                  if (count === 1) return `${others[0].userName}님이 아멘했습니다`;
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

        <div className="flex items-center gap-2 mt-0.5">
          {commentCount > 0 && !showComments && (
            <button
              className="text-[13px] text-gray-500 font-medium"
              onClick={toggleComments}
            >
              댓글 {commentCount}개 모두 보기
            </button>
          )}
        </div>

        {showComments && (
          <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {loadingComments ? (
                <div className="flex justify-center py-2">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 items-start py-2.5"
                  >
                    <Link href={`/profile/${comment.user_id}`}>
                      <UserAvatar
                        src={comment.user?.avatar_url ?? undefined}
                        alt={comment.user?.user_name}
                        size="sm"
                        hasDoneToday={comment.user?.hasDoneToday}
                      />
                    </Link>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="text-[13px] leading-snug">
                        <Link
                          href={`/profile/${comment.user_id}`}
                          className="font-bold mr-2 text-gray-900 cursor-pointer hover:text-gray-600 transition-colors"
                        >
                          {comment.user?.user_name || "알 수 없음"}
                        </Link>
                        <span className="text-gray-800 wrap-break-word">
                          {comment.content}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-400 font-medium tracking-tight">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                        <button className="text-[11px] text-gray-500 font-bold hover:text-gray-800 transition-colors">
                          답글 달기
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[11px] text-gray-400 py-2 font-medium">
                  첫 댓글을 남겨보세요.
                </p>
              )}
            </div>

            {currentUserId && (
              <form
                onSubmit={handleSubmitComment}
                className="flex items-center gap-2 pt-2 border-t border-gray-50"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글 달기..."
                  maxLength={1000}
                  className="flex-1 text-[13px] bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-400 outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="text-[13px] text-blue-500 font-bold disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  게시
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedItem;

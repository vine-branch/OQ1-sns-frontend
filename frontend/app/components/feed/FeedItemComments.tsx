"use client";

import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime, sanitizeText } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAlert } from "../AlertProvider";
import UserAvatar from "../UserAvatar";

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

interface FeedItemCommentsProps {
  postId: string;
  currentUserId: string | null;
  onCommentCountChange: (delta: number) => void;
}

export default function FeedItemComments({
  postId,
  currentUserId,
  onCommentCountChange,
}: FeedItemCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const showAlert = useAlert();

  // 최초 마운트 시 댓글 로드
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("oq_qt_comments")
        .select(
          `
          id, content, created_at, user_id,
          user:oq_users!user_id (user_name, avatar_url)
        `,
        )
        .eq("answer_id", postId)
        .order("created_at", { ascending: true });

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setComments(data as any as Comment[]);
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUserId) return;

    const supabase = createClient();
    const cleanComment = sanitizeText(commentText);

    if (cleanComment.length > 1000) {
      showAlert("댓글은 1,000자 이내로 작성해 주세요.");
      return;
    }

    if (!cleanComment) return;

    const { data, error } = await supabase
      .from("oq_qt_comments")
      .insert({
        answer_id: postId,
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
      setComments((prev) => [...prev, data as any as Comment]);
      onCommentCountChange(1);
      setCommentText("");
    } else if (error) {
      console.error(error);
      showAlert("댓글 작성 실패");
    }
  };

  return (
    <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="max-h-48 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-2">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start py-2.5">
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
          onSubmit={handleSubmit}
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
  );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Post } from "../../types";
import { useAlert } from "../AlertProvider";
import { useConfirm } from "../ConfirmProvider";
import UserAvatar from "../UserAvatar";
import UserBadges from "../UserBadges";

interface FeedItemHeaderProps {
  post: Post;
  currentUserId: string | null;
  onDeleted: () => void;
}

export default function FeedItemHeader({
  post,
  currentUserId,
  onDeleted,
}: FeedItemHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlert();
  const confirm = useConfirm();

  const displayName = post.isAnonymous ? "익명의 지체" : post.user.name;

  const handleDelete = async () => {
    if (!(await confirm("이 묵상을 삭제하시겠습니까?"))) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("oq_user_qt_answers")
      .delete()
      .eq("id", post.id)
      .eq("user_id", currentUserId!);

    if (error) {
      console.error("Delete Error:", error);
      showAlert("삭제에 실패했습니다. 다시 시도해 주세요.");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    onDeleted();
  };

  return (
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
            {!post.isAnonymous && (
              <UserBadges
                enneagramType={post.user.enneagramType}
                badges={post.user.badges}
              />
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
                      setShowMenu(false);
                      handleDelete();
                    }}
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-50"
                  onClick={async () => {
                    setShowMenu(false);
                    if (!(await confirm("이 게시물을 신고하시겠습니까?")))
                      return;

                    const supabase = createClient();
                    const { error } = await supabase.rpc("report_answer", {
                      answer_id: post.id,
                    });

                    if (error) {
                      console.error("Report Error:", error);
                      showAlert("신고 처리에 실패했습니다.");
                      return;
                    }

                    onDeleted();
                    showAlert("신고가 접수되었습니다.");
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
  );
}

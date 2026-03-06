import { createClient } from "@/lib/supabase/client";
import {
  formatLineBreaks,
  getNow,
  getStartOfToday,
  parseDate,
} from "@/lib/utils";
import { format } from "date-fns";
import { Post } from "../types";

// ─── Interfaces ───────────────────────────────────────────────────────────

export interface QtAnswerRow {
  id: string;
  meditation: string;
  created_at: string;
  is_public: boolean;
  user_id: string;
  answer_type: string;
  user: {
    id: string;
    user_name: string;
    guk_no: number;
    avatar_url?: string;
    enneagram_type?: string;
  } | null;
  daily_qt: {
    bible_book: string;
    chapter: number;
    verse_from: number;
    verse_to: number;
    content: string;
  };
  likes: {
    user_id: string;
    user: { user_name: string; avatar_url?: string };
  }[];
  comments: { count: number }[];
  liked_by_me: { user_id: string }[];
}

export interface UserPostRow {
  id: string;
  user_id?: string;
  created_at: string;
  meditation: string;
  is_public: boolean;
  oq_daily_qt: {
    qt_date: string;
    bible_book: string;
    chapter: number;
    verse_from: number;
    verse_to: number;
    content: string;
  };
  likes: { count: number }[];
  comments: { count: number }[];
  liked_by_me: { user_id: string }[];
}

export interface DBReactionRow {
  id: string;
  created_at: string;
  user: {
    user_name: string;
    avatar_url?: string;
  } | null;
}

// ─── Private Helpers ──────────────────────────────────────────────────────

/**
 * 오늘 활동한 사용자 ID 세트를 가져옵니다.
 */
async function getActiveUserIdsToday(userIds?: string[]): Promise<Set<string>> {
  const supabase = createClient();
  const startOfToday = getStartOfToday();

  let query = supabase
    .from("oq_user_qt_answers")
    .select("user_id")
    .gte("created_at", startOfToday.toISOString());

  if (userIds && userIds.length > 0) {
    query = query.in("user_id", userIds);
  }

  const { data } = await query;
  return new Set(data?.map((item) => item.user_id) || []);
}

/**
 * DB 로우를 Post 인터페이스로 변환합니다.
 */
function mapToPost(
  item: QtAnswerRow | UserPostRow,
  activeUserIds: Set<string>,
  currentUserId: string | null = null,
  isUserPost: boolean = false,
): Post {
  const userId = isUserPost
    ? (item as UserPostRow).user_id || ""
    : (item as QtAnswerRow).user_id;
  const user = !isUserPost ? (item as QtAnswerRow).user : null;
  const dailyQt = isUserPost
    ? (item as UserPostRow).oq_daily_qt
    : (item as QtAnswerRow).daily_qt;

  return {
    id: item.id,
    user: {
      id: userId,
      name: user?.user_name || "",
      avatar:
        user?.avatar_url ||
        (userId ? `https://picsum.photos/seed/${userId}/100/100` : ""),
      type: "Anytime",
      streak: 0,
      group: user ? `${user.guk_no}국` : "",
      level: 1,
      currentExp: 0,
      maxExp: 100,
      hasDoneToday: activeUserIds.has(userId),
      enneagramType: user?.enneagram_type,
    },
    content: item.meditation,
    scriptureRef: dailyQt
      ? `${dailyQt.bible_book} ${dailyQt.chapter}:${dailyQt.verse_from}-${dailyQt.verse_to}`
      : "말씀 정보 없음",
    scriptureContent: formatLineBreaks(dailyQt?.content),
    scriptureTitle: dailyQt
      ? `${dailyQt.bible_book} ${dailyQt.chapter}장`
      : undefined,
    amenCount: isUserPost
      ? (item.likes && (item.likes as { count: number }[])[0]?.count) || 0
      : (item.likes as QtAnswerRow["likes"])?.length || 0,
    likedUsers:
      !isUserPost && (item.likes as QtAnswerRow["likes"])
        ? (item.likes as QtAnswerRow["likes"]).map((l) => ({
            userId: l.user_id,
            userName: l.user?.user_name || "알 수 없음",
            avatarUrl: l.user?.avatar_url,
          }))
        : [],
    commentCount: (item.comments && item.comments[0]?.count) || 0,
    isLiked:
      (item.liked_by_me &&
        currentUserId &&
        item.liked_by_me.some((like) => like.user_id === currentUserId)) ||
      (item.liked_by_me && !currentUserId && item.liked_by_me.length > 0) ||
      false,
    timestamp: item.created_at,
    tags: [],
    isAnonymous: !item.is_public,
    imageUrl: undefined,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * 전체 공개 포스트 목록을 가져옵니다.
 */
export async function fetchPosts(
  currentUserId: string | null,
): Promise<Post[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("oq_user_qt_answers")
    .select(
      `
      id, meditation, created_at, is_public, user_id, answer_type,
      user:oq_users!user_id ( id, user_name, guk_no, avatar_url, enneagram_type ),
      daily_qt:oq_daily_qt ( bible_book, chapter, verse_from, verse_to, content ),
      likes:oq_qt_likes( user_id, user:oq_users!user_id(user_name, avatar_url) ),
      comments:oq_qt_comments(count),
      liked_by_me:oq_qt_likes(user_id)
    `,
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("Error fetching posts:", error);
    return [];
  }

  const activeUserIds = await getActiveUserIdsToday();
  return (data as unknown as QtAnswerRow[]).map((item) =>
    mapToPost(item, activeUserIds, currentUserId),
  );
}

/**
 * 사용자 프로필 정보를 가져옵니다.
 */
export async function fetchUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("oq_users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    if (error) console.error("Error fetching user profile:", error);
    return null;
  }

  return {
    ...data,
    avatar_url:
      data.avatar_url ||
      "https://k.kakaocdn.net/dn/dpk9l1/btqmGhA2lKL/Oz0wDuJn1YV2DIn92f6DVK/img_640x640.jpg",
  };
}

/**
 * 특정 사용자의 포스트 목록을 가져옵니다.
 */
export async function fetchUserPosts(
  userId: string,
  isOwnProfile: boolean,
): Promise<Post[]> {
  const supabase = createClient();

  let query = supabase
    .from("oq_user_qt_answers")
    .select(
      `
      id, created_at, meditation, is_public, user_id,
      oq_daily_qt!inner ( qt_date, bible_book, chapter, verse_from, verse_to, content ),
      likes:oq_qt_likes(count),
      comments:oq_qt_comments(count),
      liked_by_me:oq_qt_likes(user_id)
    `,
    )
    .eq("user_id", userId);

  if (!isOwnProfile) {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("Error fetching user posts:", error);
    return [];
  }

  const activeUserIds = await getActiveUserIdsToday([userId]);
  return (data as unknown as UserPostRow[]).map((item) =>
    mapToPost(item, activeUserIds, userId, true),
  );
}

/**
 * 최근 반응(아멘, 댓글) 목록을 가져옵니다.
 */
export async function fetchRecentReactions(userId: string, postIds: string[]) {
  const supabase = createClient();

  const fetchItems = async (table: string): Promise<DBReactionRow[]> => {
    const { data } = await supabase
      .from(table)
      .select("id, created_at, user:oq_users!inner(user_name)")
      .in("answer_id", postIds)
      .neq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);
    return (data as unknown as DBReactionRow[]) || [];
  };

  const [likes, comments] = await Promise.all([
    fetchItems("oq_qt_likes"),
    fetchItems("oq_qt_comments"),
  ]);

  const mapReaction = (item: DBReactionRow, type: "like" | "comment") => ({
    id: item.id,
    type,
    user_name: item.user?.user_name || "알 수 없음",
    created_at: item.created_at,
  });

  return [
    ...likes.map((l) => mapReaction(l, "like")),
    ...comments.map((c) => mapReaction(c, "comment")),
  ]
    .sort(
      (a, b) =>
        parseDate(b.created_at).getTime() - parseDate(a.created_at).getTime(),
    )
    .slice(0, 3);
}

/**
 * 오늘의 묵상 정보를 가져옵니다.
 */
export async function fetchTodayQt() {
  const supabase = createClient();
  const todayStr = format(getNow(), "yyyy-MM-dd");

  const fetchQt = (date: string) =>
    supabase.from("oq_daily_qt").select("*").eq("qt_date", date).single();

  let { data: qtData } = await fetchQt(todayStr);

  if (!qtData) {
    const { data: latestQt } = await supabase
      .from("oq_daily_qt")
      .select("*")
      .order("qt_date", { ascending: false })
      .limit(1)
      .single();
    qtData = latestQt;
  }

  return qtData
    ? { ...qtData, content: formatLineBreaks(qtData.content) }
    : null;
}

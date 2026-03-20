"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchPosts,
  fetchRecentReactions,
  fetchTodayQt,
  fetchUserPosts,
  fetchUserProfile,
} from "../services/postService";

export function usePosts(currentUserId: string | null) {
  return useQuery({
    queryKey: ["posts", currentUserId],
    queryFn: () => fetchPosts(currentUserId),
    enabled: currentUserId !== undefined,
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
  });
}

export function useUserPosts(userId: string, isOwnProfile: boolean) {
  return useQuery({
    queryKey: ["userPosts", userId, isOwnProfile],
    queryFn: () => fetchUserPosts(userId, isOwnProfile),
    enabled: !!userId,
  });
}

export function useRecentReactions(
  userId: string,
  postIds: string[],
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["reactions", userId],
    queryFn: () => fetchRecentReactions(userId, postIds),
    enabled: enabled && postIds.length > 0,
  });
}

export function useTodayQt() {
  return useQuery({
    queryKey: ["todayQt"],
    queryFn: fetchTodayQt,
  });
}

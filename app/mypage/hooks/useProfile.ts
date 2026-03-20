"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";

export interface ProfileData {
  user_name: string;
  guk_no: number;
  birth_date: string;
  enneagram_type: string | null;
  avatar_url: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      setLoading(false);
      return null;
    }
    const { data: row, error: rowError } = await supabase
      .from("oq_users")
      .select("user_name, guk_no, birth_date, enneagram_type")
      .eq("id", user.id)
      .single();

    if (rowError) {
      setError(rowError.message);
      setProfile(null);
      setLoading(false);
      return null;
    }

    const avatarUrl =
      (user.user_metadata?.avatar_url as string) ??
      (user.user_metadata?.picture as string) ??
      null;

    const raw = row.birth_date;
    const birth =
      raw == null
        ? ""
        : typeof raw === "string"
          ? raw.slice(0, 10)
          : typeof (raw as Date).toISOString === "function"
            ? (raw as Date).toISOString().slice(0, 10)
            : "";

    setProfile({
      user_name: row.user_name ?? "",
      guk_no: row.guk_no ?? 1,
      birth_date: birth,
      enneagram_type: row.enneagram_type ?? null,
      avatar_url: avatarUrl,
    });
    setLoading(false);
    return {
      user_name: row.user_name ?? "",
      guk_no: row.guk_no ?? 1,
      birth_date: birth,
      enneagram_type: row.enneagram_type ?? null,
      avatar_url: avatarUrl,
    };
  }, []);

  useEffect(() => {
    void fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
}

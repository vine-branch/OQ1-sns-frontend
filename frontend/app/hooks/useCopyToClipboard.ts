"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Options {
  successMessage?: string;
  errorMessage?: string;
  haptic?: boolean;
  resetDelay?: number;
}

export function useCopyToClipboard({
  successMessage = "복사되었습니다",
  errorMessage = "복사에 실패했습니다",
  haptic = true,
  resetDelay = 2000,
}: Options = {}) {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (haptic) navigator.vibrate?.(15);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), resetDelay);
    } catch {
      toast.error(errorMessage);
    }
  };

  return { copied, copy };
}

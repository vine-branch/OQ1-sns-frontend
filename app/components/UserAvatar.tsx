import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import React from "react";

interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  hasDoneToday?: boolean;
  isAnonymous?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    container: "w-8 h-8",
    padding: "p-[2px]",
    border: "border-2",
    imgSize: 32,
    text: "text-[10px]",
  },
  md: {
    container: "w-10 h-10",
    padding: "p-[2px]",
    border: "border-2",
    imgSize: 40,
    text: "text-[11px]",
  },
  lg: {
    container: "w-14 h-14",
    padding: "p-[2px]",
    border: "border-2",
    imgSize: 56,
    text: "text-[13px]",
  },
  xl: {
    container: "w-[88px] h-[88px]",
    padding: "p-[3px]",
    border: "border-[3px]",
    imgSize: 88,
    text: "text-[18px]",
  },
} as const;

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = "User Avatar",
  size = "md",
  hasDoneToday = false,
  isAnonymous = false,
  className,
}) => {
  const c = SIZE_CONFIG[size];

  const borderClass = hasDoneToday
    ? cn(c.border, "border-white")
    : "border border-gray-100";

  if (isAnonymous) {
    return (
      <div
        className={cn(
          "rounded-full bg-linear-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0 select-none",
          c.container,
          className,
        )}
      >
        <span className={cn(c.text, "font-bold")}>익명</span>
      </div>
    );
  }

  const fallback = (
    <div
      className={cn(
        "rounded-full w-full h-full flex items-center justify-center bg-gray-100 text-gray-400",
        c.text,
        "font-bold",
        borderClass,
      )}
    >
      {alt.charAt(0) || "?"}
    </div>
  );

  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center transition-all duration-300",
        c.container,
        hasDoneToday
          ? "bg-linear-to-tr from-yellow-400 via-red-500 to-purple-500"
          : "bg-transparent",
        hasDoneToday ? c.padding : "p-0",
        className,
      )}
    >
      <ImageWithFallback
        src={src}
        alt={alt}
        width={c.imgSize}
        height={c.imgSize}
        className={cn(
          "rounded-full object-cover w-full h-full transition-all duration-300",
          borderClass,
        )}
        fallback={fallback}
        unoptimized
      />
    </div>
  );
};

export default UserAvatar;

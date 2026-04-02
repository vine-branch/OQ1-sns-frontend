"use client";

import { ENNEAGRAM_MAP } from "../constants";

interface UserBadgesProps {
  enneagramType?: string;
  badges?: string[];
  showFullType?: boolean;
}

export default function UserBadges({ enneagramType, badges, showFullType = false }: UserBadgesProps) {
  const mainType = enneagramType?.[0];
  const type = mainType ? ENNEAGRAM_MAP[mainType] : undefined;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {type && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${type.bg} ${type.text}`}
        >
          {showFullType ? `${type.name} 타입 (${enneagramType})` : type.name}
        </span>
      )}
      {badges && badges.length > 0 && (
        <span className="inline-flex items-center gap-0.5 text-[11px]">
          {badges.map((icon, i) => (
            <span key={i} title={icon}>
              {icon}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

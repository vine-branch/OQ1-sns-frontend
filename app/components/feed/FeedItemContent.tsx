"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FeedItemContentProps {
  content: string;
  tags: string[];
  scriptureRef: string;
  timestamp: string;
  formatRelativeTime: (date: string) => string;
  onScriptureClick: () => void;
}

export default function FeedItemContent({
  content,
  tags,
  scriptureRef,
  timestamp,
  formatRelativeTime,
  onScriptureClick,
}: FeedItemContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (contentRef.current.scrollHeight > 60 || content.length > 200) {
        const timer = setTimeout(() => setShowMoreButton(true), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [content]);

  return (
    <>
      {/* Content (Caption) */}
      <div className="mb-2 leading-snug">
        <AnimatePresence initial={false}>
          <motion.div
            initial={false}
            animate={{
              height: isExpanded || !showMoreButton ? "auto" : "3.6em",
            }}
            className="overflow-hidden relative"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <span
              ref={contentRef}
              className="text-[13px] text-gray-900 whitespace-pre-wrap block"
            >
              {content}
            </span>
            {showMoreButton && !isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent" />
            )}
          </motion.div>
        </AnimatePresence>
        {showMoreButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex justify-center items-center gap-1 mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? (
              <>
                접기 <ChevronUp size={14} />
              </>
            ) : (
              <>
                더 보기 <ChevronDown size={14} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[13px] text-[#00376b] cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Scripture Reference */}
      <div className="mb-1">
        <span
          className="text-[12px] font-medium text-blue-600/80 cursor-pointer hover:underline"
          onClick={onScriptureClick}
        >
          📖 {scriptureRef}
        </span>
      </div>

      {/* Post Timestamp */}
      <div className="mb-3 px-0.5">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
          {formatRelativeTime(timestamp)}
        </p>
      </div>
    </>
  );
}

"use client";

import { useState, useCallback } from "react";

export type SpoilerTheme = "classic" | "glitch" | "mosaic" | "flame" | "editorial";

interface SpoilerViewerProps {
  content: string;
  spoilers: number[][];
  theme?: SpoilerTheme;
}

const themeStyles: Record<SpoilerTheme, { hidden: string; revealed: string; animation: string }> = {
  classic: {
    hidden: "bg-gray-800 text-gray-800",
    revealed: "bg-yellow-100 text-gray-900",
    animation: "animate-fade-in",
  },
  glitch: {
    hidden: "bg-red-900 text-red-900 animate-pulse",
    revealed: "bg-red-100 text-red-900",
    animation: "animate-glitch",
  },
  mosaic: {
    hidden: "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-transparent bg-clip-text blur-sm",
    revealed: "bg-purple-100 text-purple-900",
    animation: "animate-unblur",
  },
  flame: {
    hidden: "bg-gradient-to-t from-orange-600 via-red-500 to-yellow-400 text-transparent",
    revealed: "bg-orange-100 text-orange-900",
    animation: "animate-flame",
  },
  editorial: {
    hidden: "bg-neutral-900 text-neutral-900 font-serif",
    revealed: "bg-amber-50 text-neutral-800 font-serif border-b border-amber-700",
    animation: "animate-editorial",
  },
};

export default function SpoilerViewer({ content, spoilers, theme = "classic" }: SpoilerViewerProps) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [animating, setAnimating] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);

  const toggleSpoiler = useCallback((index: number) => {
    if (animating.has(index)) return;

    // アニメーション開始
    setAnimating((prev) => new Set(prev).add(index));

    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });

    // アニメーション終了
    setTimeout(() => {
      setAnimating((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 300);
  }, [animating]);

  const revealAll = useCallback(() => {
    setAllRevealed(true);
    const allIndices = new Set(spoilers.map((_, i) => i));
    setAnimating(allIndices);
    setRevealed(allIndices);
    setTimeout(() => setAnimating(new Set()), 300);
  }, [spoilers]);

  const hideAll = useCallback(() => {
    setAllRevealed(false);
    setRevealed(new Set());
  }, []);

  const sortedSpoilers = [...spoilers]
    .map((s, i) => ({ start: s[0], end: s[1], index: i }))
    .sort((a, b) => a.start - b.start);

  const styles = themeStyles[theme];

  const renderContent = () => {
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedSpoilers.forEach((spoiler) => {
      if (spoiler.start > lastEnd) {
        parts.push(
          <span key={`text-${spoiler.index}`}>
            {content.slice(lastEnd, spoiler.start)}
          </span>
        );
      }

      const isRevealed = revealed.has(spoiler.index);
      const isAnimating = animating.has(spoiler.index);

      parts.push(
        <span
          key={`spoiler-${spoiler.index}`}
          onClick={() => toggleSpoiler(spoiler.index)}
          className={`
            cursor-pointer rounded px-0.5 transition-all duration-300 inline-block
            ${isRevealed ? styles.revealed : styles.hidden}
            ${isAnimating && isRevealed ? styles.animation : ""}
            ${!isRevealed ? "hover:scale-105" : ""}
          `}
        >
          {isRevealed
            ? content.slice(spoiler.start, spoiler.end)
            : "█".repeat(Math.min(content.slice(spoiler.start, spoiler.end).length, 10))}
        </span>
      );
      lastEnd = spoiler.end;
    });

    if (lastEnd < content.length) {
      parts.push(<span key="text-last">{content.slice(lastEnd)}</span>);
    }

    return parts;
  };

  return (
    <div className="space-y-4">
      {/* コントロール */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={allRevealed ? hideAll : revealAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          {allRevealed ? "すべて隠す" : "すべて表示"}
        </button>
        <span className="text-sm text-gray-500">
          {revealed.size} / {spoilers.length} 表示中
        </span>
      </div>

      {/* テキスト表示 */}
      <div className="w-full min-h-[200px] p-4 bg-white rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
        {renderContent()}
      </div>

      {/* 説明 */}
      <p className="text-sm text-gray-500 text-center">
        黒い部分をタップ/クリックすると伏字が解除されます
      </p>
    </div>
  );
}

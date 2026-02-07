"use client";

import { useState, useCallback } from "react";

interface SpoilerViewerProps {
  content: string;
  spoilers: number[][];
}

export default function SpoilerViewer({ content, spoilers }: SpoilerViewerProps) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);

  const toggleSpoiler = useCallback((index: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const revealAll = useCallback(() => {
    setAllRevealed(true);
    setRevealed(new Set(spoilers.map((_, i) => i)));
  }, [spoilers]);

  const hideAll = useCallback(() => {
    setAllRevealed(false);
    setRevealed(new Set());
  }, []);

  const sortedSpoilers = [...spoilers]
    .map((s, i) => ({ start: s[0], end: s[1], index: i }))
    .sort((a, b) => a.start - b.start);

  const renderContent = () => {
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedSpoilers.forEach((spoiler) => {
      // 伏字の前のテキスト
      if (spoiler.start > lastEnd) {
        parts.push(
          <span key={`text-${spoiler.index}`}>
            {content.slice(lastEnd, spoiler.start)}
          </span>
        );
      }

      const isRevealed = revealed.has(spoiler.index);

      // 伏字部分
      parts.push(
        <span
          key={`spoiler-${spoiler.index}`}
          onClick={() => toggleSpoiler(spoiler.index)}
          className={`
            cursor-pointer rounded px-0.5 transition-all duration-200
            ${
              isRevealed
                ? "bg-yellow-100 text-gray-900"
                : "bg-gray-800 text-gray-800 hover:bg-gray-600"
            }
          `}
        >
          {isRevealed ? content.slice(spoiler.start, spoiler.end) : "█".repeat(Math.min(content.slice(spoiler.start, spoiler.end).length, 10))}
        </span>
      );
      lastEnd = spoiler.end;
    });

    // 最後のテキスト
    if (lastEnd < content.length) {
      parts.push(<span key="text-last">{content.slice(lastEnd)}</span>);
    }

    return parts;
  };

  return (
    <div className="space-y-4">
      {/* コントロール */}
      <div className="flex gap-2">
        <button
          onClick={allRevealed ? hideAll : revealAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          {allRevealed ? "すべて隠す" : "すべて表示"}
        </button>
        <span className="flex items-center text-sm text-gray-500">
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

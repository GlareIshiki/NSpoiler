"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SpoilerTheme } from "./SpoilerViewer";
import { useSiteTheme } from "@/contexts/ThemeContext";

interface SpoilerRange {
  start: number;
  end: number;
}

const themeOptions: { value: SpoilerTheme; label: string; description: string }[] = [
  { value: "classic", label: "クラシック", description: "シンプルな黒塗り" },
  { value: "glitch", label: "グリッチ", description: "ノイズ風エフェクト" },
  { value: "mosaic", label: "モザイク", description: "ぼかし効果" },
  { value: "flame", label: "フレイム", description: "炎のような演出" },
  { value: "editorial", label: "編集工学", description: "墨消し・和の趣" },
];

export default function SpoilerEditor() {
  const { data: session } = useSession();
  const { siteTheme } = useSiteTheme();
  const isEditorial = siteTheme === "editorial";
  const [content, setContent] = useState("");
  const [spoilers, setSpoilers] = useState<SpoilerRange[]>([]);
  const [theme, setTheme] = useState<SpoilerTheme>("classic");
  const [revealedInPreview, setRevealedInPreview] = useState<Set<number>>(new Set());
  const [animatingInPreview, setAnimatingInPreview] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 選択範囲を伏字に
  const handleManualSpoiler = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    setSpoilers((prev) => {
      const newSpoiler = { start, end };
      const merged = [...prev, newSpoiler].sort((a, b) => a.start - b.start);
      const result: SpoilerRange[] = [];

      for (const range of merged) {
        if (result.length === 0) {
          result.push(range);
        } else {
          const last = result[result.length - 1];
          if (range.start <= last.end) {
            last.end = Math.max(last.end, range.end);
          } else {
            result.push(range);
          }
        }
      }
      return result;
    });
  }, []);

  // ランダム伏字化
  const handleRandomSpoiler = useCallback(async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ratio: 0.3 }),
      });

      if (!res.ok) throw new Error("Failed to tokenize");

      const data = await res.json();
      setSpoilers(
        data.spoilers.map(([start, end]: [number, number]) => ({ start, end }))
      );
    } catch (error) {
      console.error(error);
      alert("ランダム伏字化に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  // リセット
  const handleReset = useCallback(() => {
    setSpoilers([]);
    setRevealedInPreview(new Set());
    setAnimatingInPreview(new Set());
    setShareUrl(null);
    setCopied(false);
  }, []);

  // プレビューで伏字をクリックして解除
  const togglePreviewSpoiler = useCallback((index: number) => {
    if (animatingInPreview.has(index)) return;

    setAnimatingInPreview((prev) => new Set(prev).add(index));

    setRevealedInPreview((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });

    setTimeout(() => {
      setAnimatingInPreview((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 300);
  }, [animatingInPreview]);

  // 共有リンク作成
  const handleShare = useCallback(async () => {
    if (!content.trim() || spoilers.length === 0) {
      alert("テキストと伏字を設定してください");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/spoiler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          spoilers: spoilers.map((s) => [s.start, s.end]),
          theme,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      const url = `${window.location.origin}/view/${data.id}`;
      setShareUrl(url);
    } catch (error) {
      console.error(error);
      alert("共有リンクの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [content, spoilers, theme]);

  // URLコピー
  const handleCopy = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  // テーマに応じたスタイル
  const getThemeStyles = (isRevealed: boolean, isAnimating: boolean) => {
    const styles: Record<SpoilerTheme, { hidden: string; revealed: string; animation: string }> = {
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
        hidden: "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-transparent blur-sm",
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

    const s = styles[theme];
    return `${isRevealed ? s.revealed : s.hidden} ${isAnimating && isRevealed ? s.animation : ""}`;
  };

  // プレビュー用にテキストをレンダリング
  const renderPreview = () => {
    if (!content) {
      return (
        <p className={`text-sm ${isEditorial ? "text-[#5a5550]" : "text-gray-400"}`}>
          {isEditorial ? "墨入れされた文章がここに現れます" : "伏字化されたテキストがここに表示されます"}
        </p>
      );
    }

    const sortedSpoilers = [...spoilers].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedSpoilers.forEach((spoiler, i) => {
      if (spoiler.start > lastEnd) {
        parts.push(
          <span key={`text-${i}`}>
            {content.slice(lastEnd, spoiler.start)}
          </span>
        );
      }

      const isRevealed = revealedInPreview.has(i);
      const isAnimating = animatingInPreview.has(i);

      parts.push(
        <span
          key={`spoiler-${i}`}
          onClick={() => togglePreviewSpoiler(i)}
          className={`
            cursor-pointer rounded px-0.5 transition-all duration-300 inline-block
            ${getThemeStyles(isRevealed, isAnimating)}
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

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="space-y-4">
      {/* テキスト入力 */}
      <div>
        <label
          htmlFor="content"
          className={`block text-sm font-medium mb-2 ${
            isEditorial ? "text-[#c9a86c]" : "text-gray-700"
          }`}
        >
          {isEditorial ? "文章を記す" : "テキストを入力"}
        </label>
        <textarea
          ref={textareaRef}
          id="content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSpoilers([]);
            setShareUrl(null);
          }}
          className={`w-full h-48 p-3 rounded-lg resize-none transition-colors ${
            isEditorial
              ? "bg-[#1a1815] border border-[#3a3530] text-[#e8e4d9] placeholder-[#5a5550] focus:border-[#c9a86c] focus:ring-2 focus:ring-[#c9a86c]/20"
              : "border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          }`}
          placeholder={isEditorial ? "秘匿すべき物語をここに..." : "ネタバレを含むテキストを入力してください..."}
        />
      </div>

      {/* ツールバー */}
      <div className={`flex flex-wrap gap-2 pb-4 border-b ${isEditorial ? "border-[#2a2520]" : "border-gray-200"}`}>
        <button
          onClick={handleManualSpoiler}
          disabled={!content}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
            isEditorial
              ? "bg-[#2a2520] text-[#c9a86c] border border-[#c9a86c] hover:bg-[#3a3530]"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {isEditorial ? "選択範囲に墨を入れる" : "選択範囲を伏字に"}
        </button>
        <button
          onClick={handleRandomSpoiler}
          disabled={!content || isLoading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
            isEditorial
              ? "bg-[#c9a86c] text-[#0a0a0a] hover:bg-[#d4b87a]"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading ? "処理中..." : isEditorial ? "自動墨入れ" : "ランダム伏字化"}
        </button>
        <button
          onClick={handleReset}
          disabled={spoilers.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
            isEditorial
              ? "bg-transparent border border-[#3a3530] text-[#8a8578] hover:border-[#5a5550]"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {isEditorial ? "白紙に戻す" : "リセット"}
        </button>
      </div>

      {/* テーマ選択 */}
      <div>
        <h3 className={`text-sm font-medium mb-2 ${isEditorial ? "text-[#c9a86c]" : "text-gray-700"}`}>
          {isEditorial ? "墨の意匠" : "伏字スタイル"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`
                p-3 rounded-lg border-2 transition-all text-left
                ${theme === option.value
                  ? isEditorial
                    ? "border-[#c9a86c] bg-[#c9a86c]/10"
                    : "border-blue-500 bg-blue-50"
                  : isEditorial
                    ? "border-[#2a2520] hover:border-[#3a3530]"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <div className={`font-medium text-sm ${isEditorial ? "text-[#e8e4d9]" : "text-gray-900"}`}>
                {option.label}
              </div>
              <div className={`text-xs ${isEditorial ? "text-[#8a8578]" : "text-gray-500"}`}>
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* プレビュー */}
      <div>
        <h3 className={`text-sm font-medium mb-2 ${isEditorial ? "text-[#c9a86c]" : "text-gray-700"}`}>
          {isEditorial ? "仕上がり（触れて開封）" : "プレビュー（クリックで伏字解除）"}
        </h3>
        <div
          className={`w-full min-h-[120px] p-3 rounded-lg whitespace-pre-wrap ${
            isEditorial
              ? "bg-[#1a1815] border border-[#2a2520] text-[#e8e4d9]"
              : "bg-gray-50 border border-gray-200 text-gray-700"
          }`}
        >
          {renderPreview()}
        </div>
      </div>

      {/* 共有ボタン */}
      <div className="flex flex-col gap-2">
        {session ? (
          <>
            {!shareUrl ? (
              <button
                onClick={handleShare}
                disabled={spoilers.length === 0 || isLoading}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
                  isEditorial
                    ? "bg-[#c9a86c] text-[#0a0a0a] hover:bg-[#d4b87a]"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isLoading ? "作成中..." : isEditorial ? "共有の符を発行" : "共有リンクを作成"}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      isEditorial
                        ? "bg-[#1a1815] border border-[#3a3530] text-[#e8e4d9]"
                        : "border border-gray-300 text-gray-700 bg-gray-50"
                    }`}
                  />
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                      isEditorial
                        ? "bg-[#c9a86c] text-[#0a0a0a] hover:bg-[#d4b87a]"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {copied ? "コピー済み!" : "コピー"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("ネタバレ注意！")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors min-h-[44px] ${
                      isEditorial
                        ? "bg-[#1a1815] border border-[#3a3530] text-[#e8e4d9] hover:bg-[#2a2520]"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    Xでシェア
                  </a>
                  <a
                    href={`https://line.me/R/msg/text/?${encodeURIComponent("ネタバレ注意！ " + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors min-h-[44px] ${
                      isEditorial
                        ? "bg-[#2a4a2a] border border-[#3a6a3a] text-[#8fbc8f] hover:bg-[#3a5a3a]"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    LINEでシェア
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className={`text-sm text-center py-3 ${isEditorial ? "text-[#8a8578]" : "text-gray-500"}`}>
            {isEditorial ? "共有には認証が必要です" : "共有リンクを作成するにはログインしてください"}
          </p>
        )}
      </div>
    </div>
  );
}

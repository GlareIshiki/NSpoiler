"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

interface SpoilerRange {
  start: number;
  end: number;
}

export default function SpoilerEditor() {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [spoilers, setSpoilers] = useState<SpoilerRange[]>([]);
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

    if (start === end) return; // 選択なし

    // 重複チェックして追加
    setSpoilers((prev) => {
      const newSpoiler = { start, end };
      // 既存の範囲と重複していたらマージ
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
    setShareUrl(null);
    setCopied(false);
  }, []);

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
  }, [content, spoilers]);

  // URLコピー
  const handleCopy = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  // プレビュー用にテキストをレンダリング
  const renderPreview = () => {
    if (!content) {
      return (
        <p className="text-gray-400 text-sm">
          伏字化されたテキストがここに表示されます
        </p>
      );
    }

    const sortedSpoilers = [...spoilers].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedSpoilers.forEach((spoiler, i) => {
      // 伏字の前のテキスト
      if (spoiler.start > lastEnd) {
        parts.push(
          <span key={`text-${i}`}>
            {content.slice(lastEnd, spoiler.start)}
          </span>
        );
      }
      // 伏字部分
      parts.push(
        <span
          key={`spoiler-${i}`}
          className="bg-gray-800 text-gray-800 hover:bg-gray-600 hover:text-white transition-colors cursor-pointer rounded px-0.5"
        >
          {content.slice(spoiler.start, spoiler.end)}
        </span>
      );
      lastEnd = spoiler.end;
    });

    // 最後のテキスト
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
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          テキストを入力
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
          className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          placeholder="ネタバレを含むテキストを入力してください..."
        />
      </div>

      {/* ツールバー */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
        <button
          onClick={handleManualSpoiler}
          disabled={!content}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          選択範囲を伏字に
        </button>
        <button
          onClick={handleRandomSpoiler}
          disabled={!content || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "処理中..." : "ランダム伏字化"}
        </button>
        <button
          onClick={handleReset}
          disabled={spoilers.length === 0}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          リセット
        </button>
      </div>

      {/* プレビュー */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          プレビュー（ホバーで伏字解除）
        </h3>
        <div className="w-full min-h-[120px] p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap">
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
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "作成中..." : "共有リンクを作成"}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-gray-50"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
                  >
                    {copied ? "コピー済み!" : "コピー"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("ネタバレ注意！")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium text-center hover:bg-gray-800 transition-colors min-h-[44px]"
                  >
                    Xでシェア
                  </a>
                  <a
                    href={`https://line.me/R/msg/text/?${encodeURIComponent("ネタバレ注意！ " + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium text-center hover:bg-green-600 transition-colors min-h-[44px]"
                  >
                    LINEでシェア
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-3">
            共有リンクを作成するにはログインしてください
          </p>
        )}
      </div>
    </div>
  );
}

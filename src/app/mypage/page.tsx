"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useSiteTheme } from "@/contexts/ThemeContext";

interface SpoilerSummary {
  id: string;
  content: string;
  spoilerCount: number;
  theme: string;
  createdAt: number;
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const { siteTheme } = useSiteTheme();
  const isEditorial = siteTheme === "editorial";
  const [spoilers, setSpoilers] = useState<SpoilerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSpoilers = useCallback(async () => {
    try {
      const res = await fetch("/api/spoiler/mine");
      if (res.ok) {
        const data = await res.json();
        setSpoilers(data.spoilers);
      }
    } catch (error) {
      console.error("Failed to fetch spoilers:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchSpoilers();
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [session, status, fetchSpoilers]);

  const handleDelete = async (id: string) => {
    if (!confirm("この投稿を削除しますか？")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/spoiler/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSpoilers((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopy = (id: string) => {
    const url = `${window.location.origin}/view/${id}`;
    navigator.clipboard.writeText(url);
    alert("リンクをコピーしました");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className={`min-h-screen ${isEditorial ? "bg-[#0a0a0a]" : "bg-gray-50"}`}>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className={`h-8 rounded w-32 ${isEditorial ? "bg-[#2a2520]" : "bg-gray-200"}`} />
            <div className={`h-24 rounded ${isEditorial ? "bg-[#2a2520]" : "bg-gray-200"}`} />
            <div className={`h-24 rounded ${isEditorial ? "bg-[#2a2520]" : "bg-gray-200"}`} />
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`min-h-screen ${isEditorial ? "bg-[#0a0a0a]" : "bg-gray-50"}`}>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className={`text-xl font-bold mb-4 ${isEditorial ? "text-[#e8e4d9]" : "text-gray-900"}`}>
              {isEditorial ? "認証が必要です" : "ログインが必要です"}
            </h2>
            <p className={`mb-6 ${isEditorial ? "text-[#8a8578]" : "text-gray-600"}`}>
              {isEditorial ? "この頁を閲覧するには認証をお願いします" : "マイページを表示するにはログインしてください"}
            </p>
            <Link
              href="/"
              className={`inline-block px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                isEditorial
                  ? "bg-[#c9a86c] text-[#0a0a0a] hover:bg-[#d4b87a]"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {isEditorial ? "表紙へ戻る" : "トップページへ"}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isEditorial ? "bg-[#0a0a0a]" : "bg-gray-50"}`}>
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${isEditorial ? "text-[#e8e4d9]" : "text-gray-900"}`}>
            {isEditorial ? "記録帳" : "マイページ"}
          </h2>
          <Link
            href="/"
            className={`text-sm ${isEditorial ? "text-[#c9a86c] hover:text-[#d4b87a]" : "text-blue-600 hover:text-blue-800"}`}
          >
            {isEditorial ? "新たに記す →" : "新規作成 →"}
          </Link>
        </div>

        {spoilers.length === 0 ? (
          <div
            className={`rounded-lg p-8 text-center relative overflow-hidden ${
              isEditorial
                ? "bg-[#171411] border border-[#2a2520] shadow-xl"
                : "bg-white shadow-sm border border-gray-200"
            }`}
          >
            {isEditorial && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a86c] to-transparent opacity-60" />
            )}
            <p className={`mb-4 ${isEditorial ? "text-[#8a8578]" : "text-gray-600"}`}>
              {isEditorial ? "まだ何も記されていません" : "まだ投稿がありません"}
            </p>
            <Link
              href="/"
              className={`inline-block px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                isEditorial
                  ? "bg-[#c9a86c] text-[#0a0a0a] hover:bg-[#d4b87a]"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {isEditorial ? "最初の一頁を記す" : "最初の投稿を作成"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {spoilers.map((spoiler) => (
              <div
                key={spoiler.id}
                className={`rounded-lg p-4 relative overflow-hidden ${
                  isEditorial
                    ? "bg-[#171411] border border-[#2a2520] shadow-xl"
                    : "bg-white shadow-sm border border-gray-200"
                }`}
              >
                {isEditorial && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a86c] to-transparent opacity-60" />
                )}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className={`whitespace-pre-wrap break-words line-clamp-3 ${isEditorial ? "text-[#e8e4d9]" : "text-gray-700"}`}>
                      {spoiler.content}
                    </p>
                    <div className={`flex items-center gap-3 mt-3 text-sm ${isEditorial ? "text-[#8a8578]" : "text-gray-500"}`}>
                      <span>🔒 {spoiler.spoilerCount}箇所</span>
                      <span>•</span>
                      <span>{formatDate(spoiler.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className={`flex flex-wrap gap-2 mt-4 pt-4 border-t ${isEditorial ? "border-[#2a2520]" : "border-gray-100"}`}>
                  <Link
                    href={`/view/${spoiler.id}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isEditorial
                        ? "bg-[#c9a86c] text-[#0a0a0a] hover:bg-[#d4b87a]"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isEditorial ? "閲覧" : "表示"}
                  </Link>
                  <button
                    onClick={() => handleCopy(spoiler.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isEditorial
                        ? "bg-transparent border border-[#3a3530] text-[#8a8578] hover:border-[#5a5550]"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {isEditorial ? "符をコピー" : "リンクをコピー"}
                  </button>
                  <button
                    onClick={() => handleDelete(spoiler.id)}
                    disabled={deletingId === spoiler.id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      isEditorial
                        ? "bg-transparent border border-[#5a3030] text-[#c97070] hover:border-[#7a4040]"
                        : "bg-white border border-red-300 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    {deletingId === spoiler.id ? "削除中..." : isEditorial ? "抹消" : "削除"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className={`text-sm text-center mt-8 ${isEditorial ? "text-[#5a5550]" : "text-gray-500"}`}>
          {isEditorial ? "記録は三十日後に自ずと消えます" : "投稿は30日後に自動的に削除されます"}
        </p>
      </main>
    </div>
  );
}

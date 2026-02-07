"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";

interface SpoilerSummary {
  id: string;
  content: string;
  spoilerCount: number;
  theme: string;
  createdAt: number;
}

export default function MyPage() {
  const { data: session, status } = useSession();
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ログインが必要です
            </h2>
            <p className="text-gray-600 mb-6">
              マイページを表示するにはログインしてください
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              トップページへ
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">マイページ</h2>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            新規作成 →
          </Link>
        </div>

        {spoilers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600 mb-4">まだ投稿がありません</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              最初の投稿を作成
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {spoilers.map((spoiler) => (
              <div
                key={spoiler.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 whitespace-pre-wrap break-words line-clamp-3">
                      {spoiler.content}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                      <span>🔒 {spoiler.spoilerCount}箇所</span>
                      <span>•</span>
                      <span>{formatDate(spoiler.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/view/${spoiler.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    表示
                  </Link>
                  <button
                    onClick={() => handleCopy(spoiler.id)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    リンクをコピー
                  </button>
                  <button
                    onClick={() => handleDelete(spoiler.id)}
                    disabled={deletingId === spoiler.id}
                    className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === spoiler.id ? "削除中..." : "削除"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500 text-center mt-8">
          投稿は30日後に自動的に削除されます
        </p>
      </main>
    </div>
  );
}

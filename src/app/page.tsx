"use client";

import { useSession } from "next-auth/react";
import Header from "@/components/Header";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 説明セクション */}
        <section className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ネタバレを伏字にして共有
          </h2>
          <p className="text-gray-600">
            物語のネタバレ部分を伏字にして、安全に共有できます
          </p>
        </section>

        {/* エディタセクション */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              テキストを入力
            </label>
            <textarea
              id="content"
              className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="ネタバレを含むテキストを入力してください..."
            />
          </div>

          {/* ツールバー */}
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200">
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors min-h-[44px]">
              選択範囲を伏字に
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]">
              ランダム伏字化
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]">
              リセット
            </button>
          </div>

          {/* プレビュー */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              プレビュー
            </h3>
            <div className="w-full min-h-[120px] p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
              <p className="text-gray-400 text-sm">
                伏字化されたテキストがここに表示されます
              </p>
            </div>
          </div>

          {/* 共有ボタン */}
          <div className="flex flex-col sm:flex-row gap-2">
            {session ? (
              <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors min-h-[44px]">
                共有リンクを作成
              </button>
            ) : (
              <p className="text-sm text-gray-500 text-center py-3">
                共有リンクを作成するにはログインしてください
              </p>
            )}
          </div>
        </section>

        {/* 使い方セクション */}
        <section className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">使い方</h3>
          <ol className="space-y-3 text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </span>
              <span>ネタバレを含むテキストを入力</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </span>
              <span>伏字にしたい部分を選択して「選択範囲を伏字に」、または「ランダム伏字化」</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </span>
              <span>共有リンクを作成してSNSでシェア</span>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}

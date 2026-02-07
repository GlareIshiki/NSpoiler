"use client";

import Header from "@/components/Header";
import SpoilerEditor from "@/components/SpoilerEditor";

export default function Home() {
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
          <SpoilerEditor />
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

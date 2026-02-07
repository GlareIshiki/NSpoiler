"use client";

import Header from "@/components/Header";
import SpoilerEditor from "@/components/SpoilerEditor";
import { useSiteTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { siteTheme } = useSiteTheme();
  const isEditorial = siteTheme === "editorial";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isEditorial ? "bg-[#0a0a0a]" : "bg-gray-50"
      }`}
    >
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 説明セクション */}
        <section className="mb-8 text-center">
          <h2
            className={`text-2xl font-bold mb-2 ${
              isEditorial ? "text-[#e8e4d9]" : "text-gray-900"
            }`}
          >
            {isEditorial ? "物語の秘密を、美しく隠す" : "ネタバレを伏字にして共有"}
          </h2>
          <p className={isEditorial ? "text-[#8a8578]" : "text-gray-600"}>
            {isEditorial
              ? "大切な物語の核心を、読み手の意思で開く"
              : "物語のネタバレ部分を伏字にして、安全に共有できます"}
          </p>
        </section>

        {/* エディタセクション */}
        <section
          className={`rounded-lg p-4 relative overflow-hidden transition-colors duration-300 ${
            isEditorial
              ? "bg-[#171411] border border-[#2a2520] shadow-xl"
              : "bg-white shadow-sm border border-gray-200"
          }`}
        >
          {isEditorial && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a86c] to-transparent opacity-60" />
          )}
          <SpoilerEditor />
        </section>

        {/* 使い方セクション */}
        <section
          className={`mt-8 rounded-lg p-4 relative overflow-hidden transition-colors duration-300 ${
            isEditorial
              ? "bg-[#171411] border border-[#2a2520] shadow-xl"
              : "bg-white shadow-sm border border-gray-200"
          }`}
        >
          {isEditorial && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a86c] to-transparent opacity-60" />
          )}
          <h3
            className={`text-lg font-bold mb-4 ${
              isEditorial ? "text-[#c9a86c]" : "text-gray-900"
            }`}
          >
            {isEditorial ? "手引き" : "使い方"}
          </h3>
          <ol className={`space-y-3 ${isEditorial ? "text-[#8a8578]" : "text-gray-600"}`}>
            <li className="flex gap-3">
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  isEditorial ? "bg-[#c9a86c] text-[#0a0a0a]" : "bg-gray-900 text-white"
                }`}
              >
                1
              </span>
              <span>{isEditorial ? "秘匿したき文章を記す" : "ネタバレを含むテキストを入力"}</span>
            </li>
            <li className="flex gap-3">
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  isEditorial ? "bg-[#c9a86c] text-[#0a0a0a]" : "bg-gray-900 text-white"
                }`}
              >
                2
              </span>
              <span>{isEditorial ? "隠すべき箇所を選び、墨を入れる" : "伏字にしたい部分を選択して「選択範囲を伏字に」、または「ランダム伏字化」"}</span>
            </li>
            <li className="flex gap-3">
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  isEditorial ? "bg-[#c9a86c] text-[#0a0a0a]" : "bg-gray-900 text-white"
                }`}
              >
                3
              </span>
              <span>{isEditorial ? "共有の符を発行し、世に放つ" : "共有リンクを作成してSNSでシェア"}</span>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}

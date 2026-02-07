"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSiteTheme } from "@/contexts/ThemeContext";

export default function Header() {
  const { data: session, status } = useSession();
  const { siteTheme, setSiteTheme } = useSiteTheme();

  const isEditorial = siteTheme === "editorial";

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isEditorial
          ? "bg-[#0f0d0a] border-[#2a2520]"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className={`text-xl font-bold transition-colors ${
            isEditorial
              ? "text-[#c9a86c] hover:text-[#d4b87a]"
              : "text-gray-900 hover:text-gray-700"
          }`}
        >
          {isEditorial ? "伏字帖" : "NSpoiler"}
        </Link>

        <div className="flex items-center gap-3">
          {/* テーマ切り替えボタン */}
          <button
            onClick={() => setSiteTheme(isEditorial ? "default" : "editorial")}
            className={`p-2 rounded-lg transition-all ${
              isEditorial
                ? "text-[#c9a86c] hover:bg-[#2a2520]"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title={isEditorial ? "通常モード" : "編集工学モード"}
          >
            {isEditorial ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {status === "loading" ? (
            <div className={`w-8 h-8 rounded-full animate-pulse ${isEditorial ? "bg-[#2a2520]" : "bg-gray-200"}`} />
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/mypage"
                className={`text-sm hidden sm:block ${
                  isEditorial
                    ? "text-[#8a8578] hover:text-[#c9a86c]"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                マイページ
              </Link>
              {session.user?.image && (
                <Link href="/mypage">
                  <Image
                    src={session.user.image}
                    alt="プロフィール"
                    width={32}
                    height={32}
                    className={`rounded-full transition-all ${
                      isEditorial
                        ? "hover:ring-2 hover:ring-[#c9a86c]"
                        : "hover:ring-2 hover:ring-blue-500"
                    }`}
                  />
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  isEditorial
                    ? "text-[#8a8578] hover:text-[#c9a86c] hover:bg-[#2a2520]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                ログアウト
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isEditorial
                  ? "bg-[#1a1815] border border-[#c9a86c] text-[#c9a86c] hover:bg-[#2a2520]"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill={isEditorial ? "#c9a86c" : "#4285F4"}
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill={isEditorial ? "#c9a86c" : "#34A853"}
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill={isEditorial ? "#c9a86c" : "#FBBC05"}
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill={isEditorial ? "#c9a86c" : "#EA4335"}
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Googleでログイン
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

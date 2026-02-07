"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SiteTheme = "default" | "editorial";

interface ThemeContextType {
  siteTheme: SiteTheme;
  setSiteTheme: (theme: SiteTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [siteTheme, setSiteTheme] = useState<SiteTheme>("default");
  const [mounted, setMounted] = useState(false);

  // ローカルストレージから復元
  useEffect(() => {
    const saved = localStorage.getItem("site-theme") as SiteTheme | null;
    if (saved && (saved === "default" || saved === "editorial")) {
      setSiteTheme(saved);
    }
    setMounted(true);
  }, []);

  // テーマ変更時に保存
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("site-theme", siteTheme);
      // bodyにクラスを適用
      document.body.classList.remove("theme-default", "theme-editorial");
      document.body.classList.add(`theme-${siteTheme}`);
    }
  }, [siteTheme, mounted]);

  // 初期レンダリング時のちらつき防止
  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ siteTheme, setSiteTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSiteTheme() {
  const context = useContext(ThemeContext);
  // SSR/静的生成時はデフォルト値を返す
  if (!context) {
    return {
      siteTheme: "default" as SiteTheme,
      setSiteTheme: () => {},
    };
  }
  return context;
}

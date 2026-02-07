# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

NSpoiler - ネタバレを伏字にして共有できるWebアプリ。ふせったーの豪華版。

主な機能:
- テキストの範囲選択で伏字化
- 形態素解析によるランダム伏字化（名詞優先）
- クリックで伏字解除
- 共有リンク生成

## コマンド

```bash
npm run dev      # 開発サーバー起動 (localhost:3000)
npm run build    # 本番ビルド
npm run lint     # ESLint実行
```

## 技術スタック

- **Next.js 16** (App Router)
- **NextAuth.js** + Google Provider（認証）
- **Tailwind CSS**（スタイリング）
- **Vercel KV**（データ保存、TTL: 30日）
- **kuromoji.js**（形態素解析、未実装）

## アーキテクチャ

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth APIルート
│   ├── layout.tsx                        # ルートレイアウト（Providers含む）
│   └── page.tsx                          # トップページ（エディタUI）
├── components/
│   ├── Header.tsx      # ヘッダー（ログイン/ログアウト）
│   └── Providers.tsx   # SessionProvider
└── types/
    └── next-auth.d.ts  # NextAuth型拡張（user.id追加）
```

## 設計方針

- **モバイルファースト**: ボタンは44px以上、タップ操作優先
- **認証必須で共有**: ログインユーザーのみ共有リンク作成可能
- **30日で自動削除**: Vercel KVのTTL機能使用

## 環境変数

`.env.local` に設定:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 今後の実装予定

1. 伏字化ロジック（手動選択 + ランダム）
2. Vercel KV連携（保存/取得）
3. 閲覧ページ（/view/[id]）
4. 共有リンク生成

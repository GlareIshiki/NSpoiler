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
- **Upstash Redis**（データ保存、TTL: 30日、開発時はインメモリフォールバック）
- **kuromoji.js**（形態素解析）

## アーキテクチャ

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth APIルート
│   │   ├── og/[id]/route.tsx            # OGP画像生成
│   │   ├── spoiler/route.ts             # 投稿作成
│   │   ├── spoiler/[id]/route.ts        # 投稿取得・削除
│   │   ├── spoiler/mine/route.ts        # 自分の投稿一覧
│   │   └── tokenize/route.ts            # 形態素解析API
│   ├── mypage/page.tsx                  # マイページ（投稿一覧）
│   ├── view/[id]/page.tsx               # 閲覧ページ
│   ├── layout.tsx                       # ルートレイアウト
│   └── page.tsx                         # トップページ（エディタUI）
├── components/
│   ├── Header.tsx         # ヘッダー（ログイン/ログアウト/マイページ）
│   ├── Providers.tsx      # SessionProvider
│   ├── SpoilerEditor.tsx  # 伏字エディタ
│   └── SpoilerViewer.tsx  # 伏字ビューワー
├── lib/
│   ├── redis.ts           # Redis/メモリストレージ
│   └── tokenizer.ts       # kuromoji形態素解析
└── types/
    └── next-auth.d.ts     # NextAuth型拡張
```

## 設計方針

- **モバイルファースト**: ボタンは44px以上、タップ操作優先
- **認証必須で共有**: ログインユーザーのみ共有リンク作成可能
- **30日で自動削除**: Vercel KVのTTL機能使用

## 環境変数

`.env.local` に設定（`.env.local.example` を参照）:
- `NEXTAUTH_URL` - アプリのURL
- `NEXTAUTH_SECRET` - セッション暗号化キー
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `KV_REST_API_URL` - Upstash Redis URL（未設定時はインメモリ）
- `KV_REST_API_TOKEN` - Upstash Redis Token

## 開発メモ

- Redis未設定時はインメモリストレージにフォールバック（開発用）
- サーバー再起動でインメモリデータは消える
- 本番ではUpstash Redisを設定すること
